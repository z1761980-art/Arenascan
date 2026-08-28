package com.proscan.ai;

import android.content.ContentProvider;
import android.content.ContentValues;
import android.content.Context;
import android.database.Cursor;
import android.database.MatrixCursor;
import android.net.Uri;
import android.os.ParcelFileDescriptor;
import android.provider.OpenableColumns;
import android.webkit.MimeTypeMap;

import java.io.File;
import java.io.FileNotFoundException;
import java.util.Base64;

public class LocalFileProvider extends ContentProvider {
    public static final String AUTHORITY = "com.proscan.ai.files";

    public static Uri uriForFile(Context context, File file) {
        String encoded = Base64.getUrlEncoder().withoutPadding()
                .encodeToString(file.getAbsolutePath().getBytes());
        return new Uri.Builder()
                .scheme("content")
                .authority(AUTHORITY)
                .appendPath(encoded)
                .build();
    }

    private File fileFor(Uri uri) {
        try {
            String encoded = uri.getLastPathSegment();
            if (encoded == null) throw new IllegalArgumentException("Missing file token");
            String path = new String(Base64.getUrlDecoder().decode(encoded));
            return new File(path);
        } catch (Exception e) {
            throw new IllegalArgumentException("Bad file uri: " + uri, e);
        }
    }

    @Override
    public boolean onCreate() {
        return true;
    }

    @Override
    public String getType(Uri uri) {
        String name = fileFor(uri).getName();
        int dot = name.lastIndexOf('.');
        if (dot >= 0) {
            String ext = name.substring(dot + 1).toLowerCase();
            String mime = MimeTypeMap.getSingleton().getMimeTypeFromExtension(ext);
            if (mime != null) return mime;
        }
        return "application/octet-stream";
    }

    @Override
    public Cursor query(Uri uri, String[] projection, String selection, String[] selectionArgs, String sortOrder) {
        File file = fileFor(uri);
        MatrixCursor cursor = new MatrixCursor(new String[]{OpenableColumns.DISPLAY_NAME, OpenableColumns.SIZE});
        cursor.addRow(new Object[]{file.getName(), file.length()});
        return cursor;
    }

    @Override
    public ParcelFileDescriptor openFile(Uri uri, String mode) throws FileNotFoundException {
        File file = fileFor(uri);
        int flags = ParcelFileDescriptor.MODE_READ_ONLY;
        if (mode != null && (mode.contains("w") || mode.contains("+") || mode.contains("a"))) {
            flags = ParcelFileDescriptor.MODE_READ_WRITE | ParcelFileDescriptor.MODE_CREATE;
        }
        return ParcelFileDescriptor.open(file, flags);
    }

    @Override public Uri insert(Uri uri, ContentValues values) { throw new UnsupportedOperationException(); }
    @Override public int delete(Uri uri, String selection, String[] selectionArgs) { throw new UnsupportedOperationException(); }
    @Override public int update(Uri uri, ContentValues values, String selection, String[] selectionArgs) { throw new UnsupportedOperationException(); }
}
