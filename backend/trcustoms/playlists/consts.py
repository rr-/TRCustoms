from django.db import models


class PlaylistStatus(models.TextChoices):
    NOT_YET_PLAYED = ("not_yet_played", "Not yet played")
    PLAYING = ("playing", "Playing")
    FINISHED = ("finished", "Finished")
    DROPPED = ("dropped", "Dropped")
    ON_HOLD = ("on_hold", "On hold")
