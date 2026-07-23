package pt.unl.fct.di.adc.firstwebapp.Utilities;

import com.google.cloud.storage.BlobId;
import com.google.cloud.storage.BlobInfo;
import com.google.cloud.storage.Storage;
import com.google.cloud.storage.StorageOptions;

import java.util.UUID;

public class GCSUploader {

    public static final String BUCKET_NAME = "adc-final-events";

    private static final Storage storage = StorageOptions.newBuilder().setProjectId(AuthHelper.PROJECT_ID).build().getService();

    private GCSUploader() {}

    public static String uploadImage(byte[] bytes, String contentType) {
        String objectName = UUID.randomUUID().toString();
        BlobId blobId = BlobId.of(BUCKET_NAME, objectName);
        BlobInfo blobInfo = BlobInfo.newBuilder(blobId)
                .setContentType(contentType)
                .build();
        storage.create(blobInfo, bytes, Storage.BlobTargetOption.predefinedAcl(Storage.PredefinedAcl.PUBLIC_READ));
        return String.format("https://storage.googleapis.com/%s/%s", BUCKET_NAME, objectName);
    }

    public static void deleteImage(String imageUrl) {
        String objectName = imageUrl.substring(imageUrl.lastIndexOf('/') + 1);
        storage.delete(BlobId.of(BUCKET_NAME, objectName));
    }
}
