from trcustoms.levels.models import Level
from trcustoms.reviews.consts import ReviewVoteType
from trcustoms.reviews.models import Review, ReviewVote
from trcustoms.users.models import User

MAX_REVIEW_VOTES_PER_LEVEL = 3


def remove_user_review_votes_for_level(user: User, level: Level) -> None:
    ReviewVote.objects.filter(user=user, review__level=level).delete()


def can_user_vote_on_review(user: User, review: Review) -> bool:
    if user.is_anonymous:
        return False
    if review.author_id == user.id:
        return False
    if review.level.authors.filter(id=user.id).exists():
        return False
    if review.level.reviews.filter(author_id=user.id).exists():
        return False
    return True


def get_user_review_vote_count_for_level(user: User, level: Level) -> int:
    return ReviewVote.objects.filter(user=user, review__level=level).count()


def update_review_vote_counts(review: Review) -> None:
    upvote_count = review.votes.filter(
        vote=ReviewVoteType.UPVOTE,
    ).count()
    downvote_count = review.votes.filter(
        vote=ReviewVoteType.DOWNVOTE,
    ).count()
    Review.objects.filter(pk=review.pk).update(
        upvote_count=upvote_count,
        downvote_count=downvote_count,
    )
