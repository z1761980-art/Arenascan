package com.proscan.ai;

import android.app.Activity;
import android.app.AlertDialog;
import android.content.Intent;
import android.graphics.Bitmap;
import android.graphics.Color;
import android.net.Uri;
import android.os.Bundle;
import android.provider.MediaStore;
import android.text.InputType;
import android.view.Gravity;
import android.view.View;
import android.widget.Button;
import android.widget.EditText;
import android.widget.ImageView;
import android.widget.LinearLayout;
import android.widget.ScrollView;
import android.widget.TextView;
import android.widget.Toast;

import java.io.File;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.Locale;

public class MainActivity extends Activity {
    private static final int REQ_CAPTURE = 1001;
    private static final int REQ_PICK = 1002;
    private static final int REQ_EDIT = 1003;

    private AppStorage.SessionData session;
    private LinearLayout pagesHolder;
    private LinearLayout savedHolder;
    private EditText nameInput;
    private EditText tagInput;
    private File pendingCameraFile;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        session = AppStorage.loadCurrentSession(this);

        ScrollView scroll = new ScrollView(this);
        scroll.setBackgroundColor(Color.parseColor("#0B0F1A"));
        LinearLayout root = new LinearLayout(this);
        root.setOrientation(LinearLayout.VERTICAL);
        root.setPadding(20, 24, 20, 24);
        scroll.addView(root);

        TextView title = new TextView(this);
        title.setText("ProScan AI");
        title.setTextColor(Color.WHITE);
        title.setTextSize(28f);
        root.addView(title);

        TextView subtitle = new TextView(this);
        subtitle.setText("Capture, clean up, save, and export multi-page scans.");
        subtitle.setTextColor(Color.parseColor("#D0D6E2"));
        subtitle.setPadding(0, 6, 0, 18);
        root.addView(subtitle);

        nameInput = edit(root, "Session name", session.name);
        tagInput = edit(root, "Tag", session.tag);

        LinearLayout buttons = new LinearLayout(this);
        buttons.setOrientation(LinearLayout.HORIZONTAL);
        buttons.setGravity(Gravity.START);
        buttons.setPadding(0, 10, 0, 8);
        buttons.addView(primaryButton("Capture", new View.OnClickListener() {
            @Override public void onClick(View v) { startCapture(); }
        }));
        buttons.addView(secondaryButton("Import", new View.OnClickListener() {
            @Override public void onClick(View v) { startImport(); }
        }));
        root.addView(buttons);

        LinearLayout buttons2 = new LinearLayout(this);
        buttons2.setOrientation(LinearLayout.HORIZONTAL);
        buttons2.setGravity(Gravity.START);
        buttons2.addView(secondaryButton("Export PDF", new View.OnClickListener() {
            @Override public void onClick(View v) { exportPdf(); }
        }));
        buttons2.addView(secondaryButton("ID Sheet", new View.OnClickListener() {
            @Override public void onClick(View v) { exportIdSheet(); }
        }));
        buttons2.addView(secondaryButton("Save Session", new View.OnClickListener() {
            @Override public void onClick(View v) { saveSession(); }
        }));
        buttons2.addView(secondaryButton("Clear", new View.OnClickListener() {
            @Override public void onClick(View v) { clearSession(); }
        }));
        root.addView(buttons2);

        TextView currentLabel = section(root, "Current pages");
        currentLabel.setPadding(0, 22, 0, 8);
        pagesHolder = new LinearLayout(this);
        pagesHolder.setOrientation(LinearLayout.VERTICAL);
        root.addView(pagesHolder);

        TextView savedLabel = section(root, "Saved scans");
        savedLabel.setPadding(0, 24, 0, 8);
        savedHolder = new LinearLayout(this);
        savedHolder.setOrientation(LinearLayout.VERTICAL);
        root.addView(savedHolder);

        TextView note = new TextView(this);
        note.setText("Note: this rescue build now includes A4 ID-card sheet export with 2x2, 2x3, and 3x3 layouts.");
        note.setTextColor(Color.parseColor("#9FB0C8"));
        note.setPadding(0, 24, 0, 0);
        root.addView(note);

        setContentView(scroll);
        refresh();
    }

    @Override
    protected void onPause() {
        super.onPause();
        syncInputs();
        AppStorage.saveCurrentSession(this, session);
    }

    private EditText edit(LinearLayout root, String hint, String value) {
        EditText input = new EditText(this);
        input.setHint(hint);
        input.setText(value == null ? "" : value);
        input.setInputType(InputType.TYPE_CLASS_TEXT);
        input.setTextColor(Color.WHITE);
        input.setHintTextColor(Color.parseColor("#7D8CA6"));
        input.setBackgroundColor(Color.parseColor("#162035"));
        LinearLayout.LayoutParams lp = new LinearLayout.LayoutParams(
                LinearLayout.LayoutParams.MATCH_PARENT, LinearLayout.LayoutParams.WRAP_CONTENT);
        lp.setMargins(0, 0, 0, 12);
        input.setLayoutParams(lp);
        root.addView(input);
        return input;
    }

    private TextView section(LinearLayout root, String text) {
        TextView tv = new TextView(this);
        tv.setText(text);
        tv.setTextSize(20f);
        tv.setTextColor(Color.WHITE);
        root.addView(tv);
        return tv;
    }

    private Button primaryButton(String text, View.OnClickListener listener) {
        Button b = new Button(this);
        b.setText(text);
        b.setAllCaps(false);
        b.setOnClickListener(listener);
        LinearLayout.LayoutParams lp = new LinearLayout.LayoutParams(0, LinearLayout.LayoutParams.WRAP_CONTENT, 1f);
        lp.setMargins(0, 0, 12, 0);
        b.setLayoutParams(lp);
        return b;
    }

    private Button secondaryButton(String text, View.OnClickListener listener) {
        Button b = new Button(this);
        b.setText(text);
        b.setAllCaps(false);
        b.setOnClickListener(listener);
        LinearLayout.LayoutParams lp = new LinearLayout.LayoutParams(0, LinearLayout.LayoutParams.WRAP_CONTENT, 1f);
        lp.setMargins(0, 0, 12, 0);
        b.setLayoutParams(lp);
        return b;
    }

    private void syncInputs() {
        session.name = nameInput.getText().toString().trim().isEmpty() ? AppStorage.defaultSessionName() : nameInput.getText().toString().trim();
        session.tag = tagInput.getText().toString().trim();
    }

    private void refresh() {
        syncInputs();
        refreshPages();
        refreshSaved();
        AppStorage.saveCurrentSession(this, session);
    }

    private void refreshPages() {
        pagesHolder.removeAllViews();
        if (session.pages.isEmpty()) {
            TextView empty = new TextView(this);
            empty.setText("No pages yet. Use Capture or Import.");
            empty.setTextColor(Color.parseColor("#A6B2C7"));
            pagesHolder.addView(empty);
            return;
        }
        for (int i = 0; i < session.pages.size(); i++) {
            final int index = i;
            final String path = session.pages.get(i);
            LinearLayout card = new LinearLayout(this);
            card.setOrientation(LinearLayout.HORIZONTAL);
            card.setPadding(14, 14, 14, 14);
            card.setBackgroundColor(Color.parseColor("#162035"));
            LinearLayout.LayoutParams clp = new LinearLayout.LayoutParams(
                    LinearLayout.LayoutParams.MATCH_PARENT, LinearLayout.LayoutParams.WRAP_CONTENT);
            clp.setMargins(0, 0, 0, 12);
            card.setLayoutParams(clp);

            Bitmap thumb = ImageUtils.decodeScaled(path, 220);
            ImageView image = new ImageView(this);
            image.setImageBitmap(thumb);
            image.setScaleType(ImageView.ScaleType.CENTER_CROP);
            LinearLayout.LayoutParams ilp = new LinearLayout.LayoutParams(180, 240);
            ilp.setMargins(0, 0, 16, 0);
            card.addView(image, ilp);

            LinearLayout info = new LinearLayout(this);
            info.setOrientation(LinearLayout.VERTICAL);
            LinearLayout.LayoutParams infoLp = new LinearLayout.LayoutParams(0, LinearLayout.LayoutParams.WRAP_CONTENT, 1f);
            card.addView(info, infoLp);

            TextView name = new TextView(this);
            name.setText("Page " + (i + 1));
            name.setTextColor(Color.WHITE);
            name.setTextSize(18f);
            info.addView(name);

            TextView sub = new TextView(this);
            sub.setText(new File(path).getName());
            sub.setTextColor(Color.parseColor("#AFC0DA"));
            info.addView(sub);

            LinearLayout row1 = new LinearLayout(this);
            row1.setOrientation(LinearLayout.HORIZONTAL);
            row1.setPadding(0, 12, 0, 0);
            row1.addView(smallButton("Edit", new View.OnClickListener() {
                @Override public void onClick(View v) { openEditor(path, index); }
            }));
            row1.addView(smallButton("Delete", new View.OnClickListener() {
                @Override public void onClick(View v) {
                    session.pages.remove(index);
                    refresh();
                }
            }));
            info.addView(row1);

            LinearLayout row2 = new LinearLayout(this);
            row2.setOrientation(LinearLayout.HORIZONTAL);
            row2.setPadding(0, 8, 0, 0);
            row2.addView(smallButton("Up", new View.OnClickListener() {
                @Override public void onClick(View v) {
                    if (index > 0) {
                        String item = session.pages.remove(index);
                        session.pages.add(index - 1, item);
                        refresh();
                    }
                }
            }));
            row2.addView(smallButton("Down", new View.OnClickListener() {
                @Override public void onClick(View v) {
                    if (index < session.pages.size() - 1) {
                        String item = session.pages.remove(index);
                        session.pages.add(index + 1, item);
                        refresh();
                    }
                }
            }));
            info.addView(row2);
            card.addView(info);
            pagesHolder.addView(card);
        }
    }

    private void refreshSaved() {
        savedHolder.removeAllViews();
        for (final AppStorage.SavedSession item : AppStorage.listSavedSessions(this)) {
            LinearLayout card = new LinearLayout(this);
            card.setOrientation(LinearLayout.VERTICAL);
            card.setPadding(16, 16, 16, 16);
            card.setBackgroundColor(Color.parseColor("#121A2D"));
            LinearLayout.LayoutParams clp = new LinearLayout.LayoutParams(
                    LinearLayout.LayoutParams.MATCH_PARENT, LinearLayout.LayoutParams.WRAP_CONTENT);
            clp.setMargins(0, 0, 0, 10);
            card.setLayoutParams(clp);
            TextView name = new TextView(this);
            name.setText(item.name + " - " + item.pageCount + " pages");
            name.setTextColor(Color.WHITE);
            name.setTextSize(17f);
            card.addView(name);
            TextView meta = new TextView(this);
            String time = new SimpleDateFormat("MMM d, HH:mm", Locale.US).format(new Date(item.createdAt));
            meta.setText(time + (item.tag.isEmpty() ? "" : " - " + item.tag));
            meta.setTextColor(Color.parseColor("#AFC0DA"));
            card.addView(meta);
            LinearLayout row = new LinearLayout(this);
            row.setOrientation(LinearLayout.HORIZONTAL);
            row.setPadding(0, 10, 0, 0);
            row.addView(smallButton("Open", new View.OnClickListener() {
                @Override public void onClick(View v) {
                    session = new AppStorage.SessionData();
                    session.name = item.name;
                    session.tag = item.tag;
                    session.pages.addAll(item.pages);
                    nameInput.setText(session.name);
                    tagInput.setText(session.tag);
                    refresh();
                }
            }));
            row.addView(smallButton("Share PDF", new View.OnClickListener() {
                @Override public void onClick(View v) {
                    sharePdf(item.name, item.pages);
                }
            }));
            row.addView(smallButton("ID Sheet", new View.OnClickListener() {
                @Override public void onClick(View v) {
                    openIdSheetPicker(item.name, item.pages);
                }
            }));
            row.addView(smallButton("Delete", new View.OnClickListener() {
                @Override public void onClick(View v) {
                    AppStorage.deleteSession(item.dir);
                    refresh();
                }
            }));
            card.addView(row);
            savedHolder.addView(card);
        }
        if (savedHolder.getChildCount() == 0) {
            TextView empty = new TextView(this);
            empty.setText("No saved scans yet.");
            empty.setTextColor(Color.parseColor("#A6B2C7"));
            savedHolder.addView(empty);
        }
    }

    private Button smallButton(String text, View.OnClickListener listener) {
        Button b = new Button(this);
        b.setText(text);
        b.setAllCaps(false);
        b.setOnClickListener(listener);
        LinearLayout.LayoutParams lp = new LinearLayout.LayoutParams(0, LinearLayout.LayoutParams.WRAP_CONTENT, 1f);
        lp.setMargins(0, 0, 8, 0);
        b.setLayoutParams(lp);
        return b;
    }

    private void startCapture() {
        try {
            pendingCameraFile = AppStorage.tempImageFile(this, "capture");
            Intent intent = new Intent(MediaStore.ACTION_IMAGE_CAPTURE);
            Uri uri = LocalFileProvider.uriForFile(this, pendingCameraFile);
            intent.putExtra(MediaStore.EXTRA_OUTPUT, uri);
            intent.addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION | Intent.FLAG_GRANT_WRITE_URI_PERMISSION);
            startActivityForResult(intent, REQ_CAPTURE);
        } catch (Exception e) {
            toast("Camera unavailable: " + e.getMessage());
        }
    }

    private void startImport() {
        Intent intent = new Intent(Intent.ACTION_GET_CONTENT);
        intent.setType("image/*");
        startActivityForResult(Intent.createChooser(intent, "Select image"), REQ_PICK);
    }

    private void openEditor(String path, int index) {
        Intent intent = new Intent(this, EditorActivity.class);
        intent.putExtra(EditorActivity.EXTRA_INPUT, path);
        intent.putExtra(EditorActivity.EXTRA_INDEX, index);
        startActivityForResult(intent, REQ_EDIT);
    }

    @Override
    protected void onActivityResult(int requestCode, int resultCode, Intent data) {
        super.onActivityResult(requestCode, resultCode, data);
        if (resultCode != RESULT_OK) return;
        try {
            if (requestCode == REQ_CAPTURE) {
                if (pendingCameraFile != null && pendingCameraFile.exists()) openEditor(pendingCameraFile.getAbsolutePath(), -1);
            } else if (requestCode == REQ_PICK && data != null && data.getData() != null) {
                File temp = AppStorage.copyUriToTemp(this, data.getData(), "import");
                openEditor(temp.getAbsolutePath(), -1);
            } else if (requestCode == REQ_EDIT && data != null) {
                String path = data.getStringExtra("path");
                int index = data.getIntExtra("index", -1);
                if (path != null) {
                    if (index >= 0 && index < session.pages.size()) session.pages.set(index, path);
                    else session.pages.add(path);
                    refresh();
                }
            }
        } catch (Exception e) {
            toast("Operation failed: " + e.getMessage());
        }
    }

    private void exportPdf() {
        sharePdf(nameInput.getText().toString().trim(), session.pages);
    }

    private void exportIdSheet() {
        openIdSheetPicker(nameInput.getText().toString().trim(), session.pages);
    }

    private void openIdSheetPicker(final String title, final java.util.List<String> pages) {
        if (pages == null || pages.isEmpty()) {
            toast("Add at least one ID card page first");
            return;
        }
        final CharSequence[] labels = new CharSequence[IdCardSheetComposer.LAYOUTS.length];
        for (int i = 0; i < IdCardSheetComposer.LAYOUTS.length; i++) {
            labels[i] = IdCardSheetComposer.LAYOUTS[i].label;
        }
        new AlertDialog.Builder(this)
                .setTitle("Print multiple ID cards on one A4 page")
                .setItems(labels, new android.content.DialogInterface.OnClickListener() {
                    @Override
                    public void onClick(android.content.DialogInterface dialog, int which) {
                        IdCardSheetComposer.LayoutOption option = IdCardSheetComposer.LAYOUTS[which];
                        shareIdSheet(title, pages, option.columns, option.rows);
                    }
                })
                .setNegativeButton("Cancel", null)
                .show();
    }

    private void sharePdf(String title, java.util.List<String> pages) {
        if (pages.isEmpty()) {
            toast("Add at least one page first");
            return;
        }
        try {
            File pdf = AppStorage.exportPdf(this, title, pages);
            Uri uri = LocalFileProvider.uriForFile(this, pdf);
            Intent send = new Intent(Intent.ACTION_SEND);
            send.setType("application/pdf");
            send.putExtra(Intent.EXTRA_STREAM, uri);
            send.putExtra(Intent.EXTRA_SUBJECT, title);
            send.addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION);
            startActivity(Intent.createChooser(send, "Share PDF"));
        } catch (Exception e) {
            toast("PDF export failed: " + e.getMessage());
        }
    }

    private void shareIdSheet(String title, java.util.List<String> pages, int columns, int rows) {
        if (pages.isEmpty()) {
            toast("Add at least one ID card page first");
            return;
        }
        try {
            File pdf = IdCardSheetComposer.exportPdf(this, title, pages, columns, rows);
            Uri uri = LocalFileProvider.uriForFile(this, pdf);
            Intent send = new Intent(Intent.ACTION_SEND);
            send.setType("application/pdf");
            send.putExtra(Intent.EXTRA_STREAM, uri);
            send.putExtra(Intent.EXTRA_SUBJECT, title);
            send.addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION);
            startActivity(Intent.createChooser(send, "Share ID Sheet PDF"));
        } catch (Exception e) {
            toast("ID Sheet export failed: " + e.getMessage());
        }
    }

    private void saveSession() {
        if (session.pages.isEmpty()) {
            toast("Nothing to save yet");
            return;
        }
        try {
            syncInputs();
            AppStorage.saveSession(this, session);
            toast("Session saved");
            refreshSaved();
        } catch (Exception e) {
            toast("Save failed: " + e.getMessage());
        }
    }

    private void clearSession() {
        session = new AppStorage.SessionData();
        nameInput.setText(session.name);
        tagInput.setText("");
        refresh();
    }

    private void toast(String message) {
        Toast.makeText(this, message, Toast.LENGTH_LONG).show();
    }
}
