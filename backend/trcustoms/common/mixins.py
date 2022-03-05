class ReadOnlyAdminMixin:
    readonly_fields = []

    def get_readonly_fields(self, request, obj=None):
        # pylint: disable=protected-access
        return (
            list(self.readonly_fields)
            + [field.name for field in obj._meta.fields]
            + [field.name for field in obj._meta.many_to_many]
        )

    def has_add_permission(self, request):
        return False

    def has_delete_permission(self, request, obj=None):
        return False
