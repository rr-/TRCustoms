def as_view(viewset, actions):
    actual_actions = {
        action: method
        for action, method in actions.items()
        if hasattr(viewset, method)
    }
    return viewset.as_view(actual_actions)


def as_list_view(viewset):
    return as_view(
        viewset,
        actions={
            "get": "list",
            "post": "create",
        },
    )


def as_detail_view(viewset):
    return as_view(
        viewset,
        actions={
            "get": "retrieve",
            "put": "update",
            "patch": "partial_update",
            "delete": "destroy",
        },
    )
