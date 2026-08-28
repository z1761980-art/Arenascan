package com.proscan.ai;

import android.content.Context;
import android.content.SharedPreferences;
import android.graphics.Bitmap;
import android.graphics.Canvas;
import android.graphics.Color;
import android.graphics.RectF;
import android.graphics.pdf.PdfDocument;
import android.net.Uri;

import org.json.JSONArray;
import org.json.JSONObject;

import java.io.File;
import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.io.InputStream;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Collections;
import java.util.Comparator;
import java.util.Date;
import java.util.List;
import java.util.Locale;

public class AppStorage {
    private static final String PREFS = "proscan_state";
    private static final String KEY_NAME = "current_name";
    private static final String KEY_TAG = "current_tag";
    private static final String KEY_PAGES = "current_pages";

    public static class SessionData {
        public String name = defaultSessionName();
        public String tag = "";
        public ArrayList<String> pages = new ArrayList<>();
    }

    public static class SavedSession {
        public String id;
        public String name;
        public String tag;
        public File dir;
        public int pageCount;
        public long createdAt;
        public ArrayList<String> pages = new ArrayList<>();
    }

    public static String defaultSessionName() {
        return new SimpleDateFormat("'ProScan' yyyyMMdd_HHmm", Locale.US).format(new Date());
    }

    public static SessionData loadCurrentSession(Context context) {
        SessionData data = new SessionData();
        SharedPreferences prefs = context.getSharedPreferences(PREFS, Context.MODE_PRIVATE);
        data.name = prefs.getString(KEY_NAME, defaultSessionName());
        data.tag = prefs.getString(KEY_TAG, "");
        try {
            JSONArray arr = new JSONArray(prefs.getString(KEY_PAGES, "[]"));
            for (int i = 0; i < arr.length(); i++) {
                String path = arr.optString(i, null);
                if (path != null && new File(path).exists()) data.pages.add(path);
            }
        } catch (Exception ignored) {
        }
        return data;
    }

    public static void saveCurrentSession(Context context, SessionData data) {
        JSONArray arr = new JSONArray();
        for (String page : data.pages) arr.put(page);
        context.getSharedPreferences(PREFS, Context.MODE_PRIVATE)
                .edit()
                .putString(KEY_NAME, data.name)
                .putString(KEY_TAG, data.tag)
                .putString(KEY_PAGES, arr.toString())
                .apply();
    }

    public static File ensureDir(File dir) {
        if (!dir.exists()) dir.mkdirs();
        return dir;
    }

    public static File tempImageFile(Context context, String prefix) {
        return new File(ensureDir(new File(context.getCacheDir(), "working")),
                prefix + "_" + System.currentTimeMillis() + ".jpg");
    }

    public static File writeBitmap(Context context, String prefix, Bitmap bitmap) throws Exception {
        File out = tempImageFile(context, prefix);
        FileOutputStream fos = new FileOutputStream(out);
        bitmap.compress(Bitmap.CompressFormat.JPEG, 95, fos);
        fos.flush();
        fos.close();
        return out;
    }

    public static File copyUriToTemp(Context context, Uri uri, String prefix) throws Exception {
        File out = tempImageFile(context, prefix);
        InputStream in = context.getContentResolver().openInputStream(uri);
        FileOutputStream fos = new FileOutputStream(out);
        byte[] buf = new byte[8192];
        int read;
        while (in != null && (read = in.read(buf)) != -1) {
            fos.write(buf, 0, read);
        }
        if (in != null) in.close();
        fos.flush();
        fos.close();
        return out;
    }

    public static File saveSession(Context context, SessionData data) throws Exception {
        String id = String.valueOf(System.currentTimeMillis());
        File dir = ensureDir(new File(ensureDir(new File(context.getFilesDir(), "sessions")), id));
        JSONArray pages = new JSONArray();
        for (int i = 0; i < data.pages.size(); i++) {
            String name = String.format(Locale.US, "page_%02d.jpg", i + 1);
            File dst = new File(dir, name);
            copyFile(new File(data.pages.get(i)), dst);
            pages.put(name);
        }
        JSONObject obj = new JSONObject();
        obj.put("id", id);
        obj.put("name", data.name == null || data.name.trim().isEmpty() ? defaultSessionName() : data.name.trim());
        obj.put("tag", data.tag == null ? "" : data.tag.trim());
        obj.put("createdAt", System.currentTimeMillis());
        obj.put("pages", pages);
        File meta = new File(dir, "metadata.json");
        FileOutputStream fos = new FileOutputStream(meta);
        fos.write(obj.toString(2).getBytes());
        fos.flush();
        fos.close();
        return dir;
    }

    public static ArrayList<SavedSession> listSavedSessions(Context context) {
        ArrayList<SavedSession> list = new ArrayList<>();
        File root = new File(context.getFilesDir(), "sessions");
        File[] dirs = root.listFiles();
        if (dirs == null) return list;
        for (File dir : dirs) {
            try {
                File meta = new File(dir, "metadata.json");
                if (!meta.exists()) continue;
                byte[] bytes = readAll(meta);
                JSONObject obj = new JSONObject(new String(bytes));
                SavedSession item = new SavedSession();
                item.id = obj.optString("id", dir.getName());
                item.name = obj.optString("name", "Untitled scan");
                item.tag = obj.optString("tag", "");
                item.createdAt = obj.optLong("createdAt", dir.lastModified());
                item.dir = dir;
                JSONArray arr = obj.optJSONArray("pages");
                if (arr != null) {
                    for (int i = 0; i < arr.length(); i++) {
                        String name = arr.optString(i, null);
                        if (name != null) item.pages.add(new File(dir, name).getAbsolutePath());
                    }
                }
                item.pageCount = item.pages.size();
                list.add(item);
            } catch (Exception ignored) {
            }
        }
        Collections.sort(list, new Comparator<SavedSession>() {
            @Override
            public int compare(SavedSession a, SavedSession b) {
                return Long.compare(b.createdAt, a.createdAt);
            }
        });
        return list;
    }

    public static void deleteSession(File dir) {
        deleteRecursive(dir);
    }

    public static File exportPdf(Context context, String title, List<String> pages) throws Exception {
        PdfDocument doc = new PdfDocument();
        int pageW = 595;
        int pageH = 842;
        for (int i = 0; i < pages.size(); i++) {
            PdfDocument.PageInfo info = new PdfDocument.PageInfo.Builder(pageW, pageH, i + 1).create();
            PdfDocument.Page page = doc.startPage(info);
            Canvas canvas = page.getCanvas();
            canvas.drawColor(Color.WHITE);
            Bitmap bmp = ImageUtils.decodeScaled(pages.get(i), 2200);
            if (bmp != null) {
                RectF box = fitRect(pageW, pageH, bmp.getWidth(), bmp.getHeight(), 28f);
                canvas.drawBitmap(bmp, null, new android.graphics.RectF(box), null);
            }
            doc.finishPage(page);
        }
        File out = new File(ensureDir(new File(context.getCacheDir(), "exports")),
                (title == null || title.trim().isEmpty() ? "ProScan" : title.trim().replaceAll("[^a-zA-Z0-9._-]+", "_"))
                        + "_" + System.currentTimeMillis() + ".pdf");
        FileOutputStream fos = new FileOutputStream(out);
        doc.writeTo(fos);
        fos.flush();
        fos.close();
        doc.close();
        return out;
    }

    private static RectF fitRect(int pageW, int pageH, int imgW, int imgH, float margin) {
        float maxW = pageW - margin * 2f;
        float maxH = pageH - margin * 2f;
        float scale = Math.min(maxW / imgW, maxH / imgH);
        float w = imgW * scale;
        float h = imgH * scale;
        float left = (pageW - w) / 2f;
        float top = (pageH - h) / 2f;
        return new RectF(left, top, left + w, top + h);
    }

    private static void copyFile(File src, File dst) throws Exception {
        FileInputStream in = new FileInputStream(src);
        FileOutputStream out = new FileOutputStream(dst);
        byte[] buf = new byte[8192];
        int read;
        while ((read = in.read(buf)) != -1) out.write(buf, 0, read);
        in.close();
        out.flush();
        out.close();
    }

    private static byte[] readAll(File file) throws Exception {
        FileInputStream in = new FileInputStream(file);
        byte[] buf = new byte[(int) file.length()];
        int off = 0;
        while (off < buf.length) {
            int read = in.read(buf, off, buf.length - off);
            if (read < 0) break;
            off += read;
        }
        in.close();
        return buf;
    }

    private static void deleteRecursive(File file) {
        if (file == null || !file.exists()) return;
        if (file.isDirectory()) {
            File[] kids = file.listFiles();
            if (kids != null) for (File kid : kids) deleteRecursive(kid);
        }
        file.delete();
    }
}
