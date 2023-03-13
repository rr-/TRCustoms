from django.core.management.base import BaseCommand
from tqdm import tqdm

from trcustoms.awards.logic import update_award_rarities
from trcustoms.awards.models import UserAward
from trcustoms.tasks import update_awards
from trcustoms.users.models import User


class Command(BaseCommand):
    help = "Update awards."

    def add_arguments(self, parser):
        parser.add_argument("-d", "--delete", action="store_true")

    def handle(self, *args, **options):
        if options["delete"]:
            UserAward.objects.all().delete()

        with tqdm(desc="Users", total=User.objects.count()) as progress:
            for user in User.objects.iterator():
                update_awards(user.pk, update_rarity=False)
                progress.update()

        update_award_rarities()
