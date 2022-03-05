from trcustoms.audit_logs.utils import (
    track_model_creation,
    track_model_deletion,
    track_model_update,
)


class AuditLogAdminMixin:
    def log_addition(self, request, obj, message):
        super().log_addition(request, obj, message)
        obj = self.get_audit_log_obj(obj)
        track_model_creation(obj, request=request)

    def log_change(self, request, obj, message):
        super().log_change(request, obj, message)
        obj = self.get_audit_log_obj(obj)
        # TODO: figure out a way to track more detailed changes
        track_model_update(obj, request=request, force=True)

    def log_deletion(self, request, obj, object_repr):
        super().log_deletion(request, obj, object_repr)
        obj = self.get_audit_log_obj(obj)
        track_model_deletion(obj, request=request)

    def get_audit_log_obj(self, obj):
        return obj
