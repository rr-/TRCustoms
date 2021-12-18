# pylint: disable=unused-import,import-outside-toplevel
from django.apps import AppConfig


class TRCustomsConfig(AppConfig):
    name = "trcustoms"
    verbose_name = "TR Customs"
    default = True

    def ready(self):
        import trcustoms.signals
