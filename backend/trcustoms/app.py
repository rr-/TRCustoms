# pylint: disable=unused-import,import-outside-toplevel
from django.apps import AppConfig
from django.utils.translation import ugettext_lazy as _


class TRCustomsConfig(AppConfig):
    name = "trcustoms"
    verbose_name = _("TR Customs")

    def ready(self):
        import trcustoms.signals
