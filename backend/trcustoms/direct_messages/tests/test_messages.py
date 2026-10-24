import pytest
from rest_framework import status
from rest_framework.test import APIClient
from rest_framework_simplejwt.tokens import RefreshToken

from trcustoms.audit_logs.consts import ChangeType
from trcustoms.audit_logs.models import AuditLog
from trcustoms.direct_messages.models import Message, Thread
from trcustoms.users.models import User, UserSettings
from trcustoms.users.tests.factories import UserFactory


def client_for(user) -> APIClient:
    api_client = APIClient()
    token = RefreshToken.for_user(user).access_token
    api_client.credentials(HTTP_X_ACCESS_TOKEN=f"Bearer {token}")
    api_client.user = user
    return api_client


def start(api_client: APIClient, receiver, text="hello", **kwargs):
    return api_client.post(
        "/api/messages/threads/",
        format="json",
        data={"receiver_id": receiver.id, "text": text, **kwargs},
    )


def reply(api_client: APIClient, thread_id: int, text="thanks"):
    return api_client.post(
        f"/api/messages/threads/{thread_id}/reply/",
        format="json",
        data={"text": text},
    )


def list_threads(api_client: APIClient, **params) -> list[dict]:
    resp = api_client.get("/api/messages/threads/", data=params)
    assert resp.status_code == status.HTTP_200_OK, resp.content
    return resp.json()["results"]


def thread_texts(api_client: APIClient, thread_id: int, **params) -> list:
    resp = api_client.get(
        f"/api/messages/threads/{thread_id}/messages/", data=params
    )
    assert resp.status_code == status.HTTP_200_OK, resp.content
    return [message["text"] for message in resp.json()["results"]]


def administrator() -> User:
    return UserFactory(username="Administration")


@pytest.mark.django_db
def test_start_thread_requires_login(api_client: APIClient) -> None:
    resp = start(api_client, UserFactory(username="receiver"))
    assert resp.status_code == status.HTTP_401_UNAUTHORIZED


@pytest.mark.django_db
def test_start_thread(auth_api_client: APIClient) -> None:
    receiver = UserFactory(username="receiver")

    resp = start(auth_api_client, receiver, "hi there")

    assert resp.status_code == status.HTTP_201_CREATED, resp.content
    data = resp.json()
    assert data["other_user"]["id"] == receiver.id
    assert thread_texts(auth_api_client, data["id"]) == ["hi there"]
    thread = Thread.objects.get()
    assert thread.starter == auth_api_client.user
    assert thread.recipient == receiver
    message = Message.objects.get()
    assert not message.is_read
    assert message.sender == auth_api_client.user
    assert message.origin_sender == auth_api_client.user
    assert message.receiver == receiver

    audit_log = AuditLog.objects.get()
    assert audit_log.change_type == ChangeType.CREATE
    assert audit_log.change_author == auth_api_client.user
    assert audit_log.object_name == f"#{message.id} to receiver"
    assert audit_log.changes == [
        f"Sent from {auth_api_client.user.username}: hi there"
    ]


@pytest.mark.django_db
def test_start_thread_rejects_long_text(auth_api_client: APIClient) -> None:
    resp = start(auth_api_client, UserFactory(username="receiver"), "x" * 1001)
    assert resp.status_code == status.HTTP_400_BAD_REQUEST
    assert "text" in resp.json()


@pytest.mark.django_db
def test_messaging_a_contact_again_reuses_the_conversation() -> None:
    alice = UserFactory(username="alice")
    bob = UserFactory(username="bob")
    alice_client = client_for(alice)
    thread_id = start(alice_client, bob, "first").json()["id"]
    reply(client_for(bob), thread_id, "second")

    resp = start(alice_client, bob, "third")

    assert resp.status_code == status.HTTP_201_CREATED, resp.content
    assert resp.json()["id"] == thread_id
    assert thread_texts(alice_client, thread_id) == [
        "first",
        "second",
        "third",
    ]
    assert Thread.objects.count() == 1
    quota = alice_client.get("/api/messages/quota/").json()
    assert quota["used"] == 1


@pytest.mark.django_db
def test_messaging_back_reuses_the_conversation() -> None:
    alice = UserFactory(username="alice")
    bob = UserFactory(username="bob")
    thread_id = start(client_for(alice), bob).json()["id"]

    resp = start(client_for(bob), alice, "hi back")

    assert resp.json()["id"] == thread_id
    assert Thread.objects.count() == 1


@pytest.mark.django_db
def test_messaging_a_contact_again_respects_blocking() -> None:
    alice = UserFactory(username="alice")
    bob = UserFactory(username="bob")
    alice_client = client_for(alice)
    start(alice_client, bob)
    bob_settings, _ = UserSettings.objects.get_or_create(user=bob)
    bob_settings.blocked_users.add(alice)

    resp = start(alice_client, bob)

    assert resp.status_code == status.HTTP_400_BAD_REQUEST
    assert resp.json() == {"receiver_id": ["This user cannot be messaged."]}


@pytest.mark.django_db
def test_start_thread_respects_disabled_messages(
    auth_api_client: APIClient,
) -> None:
    receiver = UserFactory(username="receiver")
    UserSettings.objects.update_or_create(
        user=receiver, defaults={"allow_messages": False}
    )

    resp = start(auth_api_client, receiver)

    assert resp.status_code == status.HTTP_400_BAD_REQUEST
    assert resp.json() == {"receiver_id": ["This user cannot be messaged."]}


@pytest.mark.django_db
def test_daily_limit_counts_new_threads_only() -> None:
    alice = UserFactory(username="alice")
    bob = UserFactory(username="bob")
    alice_client = client_for(alice)
    thread_id = start(alice_client, bob).json()["id"]
    for i in range(4):
        receiver = UserFactory(username=f"receiver{i}")
        assert start(alice_client, receiver).status_code == 201
    for _ in range(3):
        assert reply(alice_client, thread_id).status_code == 201
    assert start(alice_client, bob).status_code == 201

    resp = start(alice_client, UserFactory(username="carol"))

    assert resp.status_code == status.HTTP_400_BAD_REQUEST
    assert resp.json() == {
        "non_field_errors": [
            "You have reached your daily limit of new conversations."
        ]
    }
    quota = alice_client.get("/api/messages/quota/").json()
    assert quota == {"limit": 5, "used": 5, "remaining": 0}


@pytest.mark.django_db
def test_daily_limit_grows_with_contributions(
    auth_api_client: APIClient,
) -> None:
    user = auth_api_client.user
    user.authored_level_count_approved = 1
    user.reviewed_level_count = 1
    user.authored_walkthrough_count_approved = 1
    user.save()

    quota = auth_api_client.get("/api/messages/quota/").json()

    assert quota == {"limit": 20, "used": 0, "remaining": 20}


@pytest.mark.django_db
def test_reply_and_conversation_list() -> None:
    alice = UserFactory(username="alice")
    bob = UserFactory(username="bob")
    alice_client = client_for(alice)
    bob_client = client_for(bob)
    thread_id = start(alice_client, bob, "first").json()["id"]

    resp = reply(bob_client, thread_id, "second")

    assert resp.status_code == status.HTTP_201_CREATED, resp.content
    [listed] = list_threads(alice_client)
    assert listed["id"] == thread_id
    assert listed["other_user"]["id"] == bob.id
    assert listed["last_message_text"] == "second"
    assert listed["last_message_is_own"] is False
    assert listed["has_unread"] is True
    [listed] = list_threads(bob_client)
    assert listed["other_user"]["id"] == alice.id
    assert listed["last_message_is_own"] is True
    assert listed["has_unread"] is True

    details = alice_client.get(f"/api/messages/threads/{thread_id}/").json()
    assert thread_texts(alice_client, thread_id) == ["first", "second"]
    assert details["other_user"]["id"] == bob.id
    assert details["can_reply"] is True
    assert list_threads(alice_client)[0]["has_unread"] is False
    assert list_threads(bob_client)[0]["has_unread"] is True


@pytest.mark.django_db
def test_conversation_opens_on_the_latest_page() -> None:
    alice = UserFactory(username="alice")
    alice_client = client_for(alice)
    thread_id = start(alice_client, UserFactory(username="bob"), "0").json()[
        "id"
    ]
    for i in range(1, 25):
        reply(alice_client, thread_id, str(i))

    resp = alice_client.get(f"/api/messages/threads/{thread_id}/messages/")

    assert resp.json()["current_page"] == 2
    assert resp.json()["last_page"] == 2
    assert thread_texts(alice_client, thread_id) == [
        str(i) for i in range(20, 25)
    ]
    assert thread_texts(alice_client, thread_id, page=1) == [
        str(i) for i in range(20)
    ]


@pytest.mark.django_db
def test_outsiders_cannot_read_conversation_messages() -> None:
    thread_id = start(
        client_for(UserFactory(username="alice")),
        UserFactory(username="bob"),
    ).json()["id"]

    resp = client_for(UserFactory(username="eve")).get(
        f"/api/messages/threads/{thread_id}/messages/"
    )

    assert resp.status_code == status.HTTP_404_NOT_FOUND


@pytest.mark.django_db
def test_conversation_list_orders_by_latest_message() -> None:
    alice = UserFactory(username="alice")
    alice_client = client_for(alice)
    bob_thread = start(alice_client, UserFactory(username="bob")).json()["id"]
    carol_thread = start(alice_client, UserFactory(username="carol")).json()[
        "id"
    ]
    assert [t["id"] for t in list_threads(alice_client)] == [
        carol_thread,
        bob_thread,
    ]

    reply(alice_client, bob_thread)

    assert [t["id"] for t in list_threads(alice_client)] == [
        bob_thread,
        carol_thread,
    ]


@pytest.mark.django_db
def test_conversation_list_search() -> None:
    alice = UserFactory(username="alice")
    alice_client = client_for(alice)
    bob_thread = start(alice_client, UserFactory(username="bob"), "TR4 crash")
    carol_thread = start(alice_client, UserFactory(username="carol"), "hi")
    bob_thread, carol_thread = (
        bob_thread.json()["id"],
        carol_thread.json()["id"],
    )

    def search(text: str) -> list[int]:
        return [t["id"] for t in list_threads(alice_client, search=text)]

    assert search("caro") == [carol_thread]
    assert search("crash") == [bob_thread]
    assert search("alice") == []


@pytest.mark.django_db
def test_outsiders_cannot_see_or_reply_to_thread() -> None:
    alice = UserFactory(username="alice")
    bob = UserFactory(username="bob")
    eve_client = client_for(UserFactory(username="eve"))
    thread_id = start(client_for(alice), bob).json()["id"]

    assert list_threads(eve_client) == []
    resp = eve_client.get(f"/api/messages/threads/{thread_id}/")
    assert resp.status_code == status.HTTP_404_NOT_FOUND
    assert reply(eve_client, thread_id).status_code == 404


@pytest.mark.django_db
def test_disabling_messages_keeps_existing_threads_open() -> None:
    alice = UserFactory(username="alice")
    bob = UserFactory(username="bob")
    thread_id = start(client_for(alice), bob).json()["id"]
    UserSettings.objects.update_or_create(
        user=bob, defaults={"allow_messages": False}
    )

    assert reply(client_for(alice), thread_id).status_code == 201


@pytest.mark.django_db
def test_blocking_stops_replies() -> None:
    alice = UserFactory(username="alice")
    bob = UserFactory(username="bob")
    alice_client = client_for(alice)
    thread_id = start(alice_client, bob).json()["id"]
    bob_settings, _ = UserSettings.objects.get_or_create(user=bob)
    bob_settings.blocked_users.add(alice)

    resp = reply(alice_client, thread_id)

    assert resp.status_code == status.HTTP_403_FORBIDDEN
    details = alice_client.get(f"/api/messages/threads/{thread_id}/").json()
    assert details["can_reply"] is False


@pytest.mark.django_db
def test_start_thread_as_administrator_requires_permission(
    auth_api_client: APIClient,
) -> None:
    resp = start(
        auth_api_client,
        UserFactory(username="receiver"),
        send_as_administrator=True,
    )
    assert resp.status_code == status.HTTP_400_BAD_REQUEST
    assert "send_as_administrator" in resp.json()


@pytest.mark.django_db
def test_start_thread_as_administrator(staff_api_client: APIClient) -> None:
    administrator()
    receiver = UserFactory(username="receiver")
    UserSettings.objects.update_or_create(
        user=receiver, defaults={"allow_messages": False}
    )

    resp = start(staff_api_client, receiver, send_as_administrator=True)

    assert resp.status_code == status.HTTP_201_CREATED, resp.content
    thread = Thread.objects.get()
    assert thread.starter == administrator()
    message = thread.messages.get()
    assert message.sender == administrator()
    assert message.origin_sender == staff_api_client.user
    assert resp.json()["replies_as_administrator"] is True
    assert AuditLog.objects.filter(
        change_author=staff_api_client.user,
        changes=["Sent from Administration: hello"],
    ).exists()


@pytest.mark.django_db
def test_moderators_share_the_administrator_mailbox(
    staff_api_client: APIClient,
) -> None:
    user = UserFactory(username="user")
    user_client = client_for(user)
    thread_id = start(user_client, administrator()).json()["id"]

    [listed] = list_threads(staff_api_client, as_administrator="1")
    assert listed["id"] == thread_id
    assert listed["other_user"]["id"] == user.id
    assert listed["has_unread"] is True
    assert list_threads(staff_api_client) == []

    resp = reply(staff_api_client, thread_id, "we're on it")
    assert resp.status_code == status.HTTP_201_CREATED, resp.content
    message = Message.objects.get(text="we're on it")
    assert message.sender == administrator()
    assert message.origin_sender == staff_api_client.user
    assert message.receiver == user

    resp = user_client.get("/api/messages/threads/", {"as_administrator": "1"})
    assert resp.status_code == status.HTTP_403_FORBIDDEN


@pytest.mark.django_db
def test_message_settings(auth_api_client: APIClient) -> None:
    blocked = UserFactory(username="blocked")

    resp = auth_api_client.put(
        "/api/messages/settings/",
        format="json",
        data={"allow_messages": False, "blocked_user_ids": [blocked.id]},
    )

    assert resp.status_code == status.HTTP_200_OK, resp.content
    data = auth_api_client.get("/api/messages/settings/").json()
    assert data["allow_messages"] is False
    assert [user["id"] for user in data["blocked_users"]] == [blocked.id]


@pytest.mark.django_db
def test_user_details_report_messaging_state() -> None:
    alice = UserFactory(username="alice")
    bob = UserFactory(username="bob")
    alice_client = client_for(alice)
    start(alice_client, bob)

    bob_as_seen_by_alice = alice_client.get(f"/api/users/{bob.id}/").json()
    assert bob_as_seen_by_alice["can_message"] is True
    assert bob_as_seen_by_alice["has_unread_messages"] is False

    bob_client = client_for(bob)
    bob_as_seen_by_bob = bob_client.get(f"/api/users/{bob.id}/").json()
    assert bob_as_seen_by_bob["can_message"] is False
    assert bob_as_seen_by_bob["has_unread_messages"] is True

    thread_id = Message.objects.get().thread_id
    bob_client.get(f"/api/messages/threads/{thread_id}/")
    bob_as_seen_by_bob = bob_client.get(f"/api/users/{bob.id}/").json()
    assert bob_as_seen_by_bob["has_unread_messages"] is False

    bob_client.post(f"/api/messages/threads/{thread_id}/mark_unread/")
    bob_as_seen_by_bob = bob_client.get(f"/api/users/{bob.id}/").json()
    assert bob_as_seen_by_bob["has_unread_messages"] is True


@pytest.mark.django_db
def test_audit_log_filters_sent_messages(staff_api_client: APIClient) -> None:
    start(staff_api_client, UserFactory(username="receiver"), "hi")

    resp = staff_api_client.get(
        "/api/auditlogs/", data={"search": "message:sent"}
    )

    assert resp.status_code == status.HTTP_200_OK, resp.content
    results = resp.json()["results"]
    assert [result["changes"] for result in results] == [
        [f"Sent from {staff_api_client.user.username}: hi"]
    ]


@pytest.mark.django_db
def test_mark_unread_marks_the_latest_received_message() -> None:
    alice = UserFactory(username="alice")
    bob = UserFactory(username="bob")
    alice_client = client_for(alice)
    bob_client = client_for(bob)
    thread_id = start(alice_client, bob, "first").json()["id"]
    reply(alice_client, thread_id, "second")
    reply(bob_client, thread_id, "answer")
    details = bob_client.get(f"/api/messages/threads/{thread_id}/").json()
    assert details["can_mark_unread"] is True
    assert list_threads(bob_client)[0]["has_unread"] is False

    resp = bob_client.post(f"/api/messages/threads/{thread_id}/mark_unread/")

    assert resp.status_code == status.HTTP_200_OK, resp.content
    assert list(
        Message.objects.filter(receiver=bob, is_read=False).values_list(
            "text", flat=True
        )
    ) == ["second"]
    assert list_threads(bob_client)[0]["has_unread"] is True


@pytest.mark.django_db
def test_mark_unread_needs_a_received_message() -> None:
    alice_client = client_for(UserFactory(username="alice"))
    thread_id = start(alice_client, UserFactory(username="bob")).json()["id"]
    details = alice_client.get(f"/api/messages/threads/{thread_id}/").json()
    assert details["can_mark_unread"] is False

    resp = alice_client.post(f"/api/messages/threads/{thread_id}/mark_unread/")

    assert resp.status_code == status.HTTP_400_BAD_REQUEST


@pytest.mark.django_db
def test_outsiders_cannot_mark_unread() -> None:
    thread_id = start(
        client_for(UserFactory(username="alice")),
        UserFactory(username="bob"),
    ).json()["id"]

    resp = client_for(UserFactory(username="eve")).post(
        f"/api/messages/threads/{thread_id}/mark_unread/"
    )

    assert resp.status_code == status.HTTP_404_NOT_FOUND


@pytest.mark.django_db
def test_moderators_mark_administrator_messages_unread(
    staff_api_client: APIClient,
) -> None:
    user_client = client_for(UserFactory(username="user"))
    thread_id = start(user_client, administrator(), "help").json()["id"]
    Message.objects.update(is_read=True)

    resp = staff_api_client.post(
        f"/api/messages/threads/{thread_id}/mark_unread/"
    )

    assert resp.status_code == status.HTTP_200_OK, resp.content
    assert not Message.objects.get().is_read


@pytest.mark.django_db
def test_conversation_list_flags_own_last_message() -> None:
    alice = UserFactory(username="alice")
    bob = UserFactory(username="bob")
    alice_client = client_for(alice)
    bob_client = client_for(bob)
    thread_id = start(alice_client, bob, "first").json()["id"]
    reply(alice_client, thread_id, "second")

    assert list_threads(bob_client)[0]["last_message_is_own"] is False
    assert list_threads(alice_client)[0]["last_message_is_own"] is True

    reply(bob_client, thread_id, "answer")

    assert list_threads(bob_client)[0]["last_message_is_own"] is True
    assert list_threads(alice_client)[0]["last_message_is_own"] is False
