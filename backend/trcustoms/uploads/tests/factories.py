import factory

from trcustoms.uploads.models import UploadedFile


class UploadedFileFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = UploadedFile
