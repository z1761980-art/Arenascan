package com.proscan.ai;

import android.content.Context;
import android.graphics.Bitmap;
import android.graphics.Canvas;
import android.graphics.Color;
import android.graphics.Paint;
import android.graphics.RectF;
import android.graphics.pdf.PdfDocument;

import java.io.File;
import java.io.FileOutputStream;
import java.util.List;

public class IdCardSheetComposer {
    public static final float ID_CARD_ASPECT = 85.6f / 54f;

    public static final class LayoutOption {
        public final int columns;
        public final int rows;
        public final String label;

        public LayoutOption(int columns, int rows, String label) {
            this.columns = columns;
            this.rows = rows;
            this.label = label;
        }

        public int slotsPerPage() {
            return columns * rows;
        }
    }

    public static final LayoutOption[] LAYOUTS = new LayoutOption[]{
            new LayoutOption(2, 2, "2 x 2  (4 cards per A4)"),
            new LayoutOption(2, 3, "2 x 3  (6 cards per A4)"),
            new LayoutOption(3, 3, "3 x 3  (9 cards per A4)")
    };

    private IdCardSheetComposer() {
    }

    public static File exportPdf(Context context, String title, List<String> imagePaths, int columns, int rows) throws Exception {
        PdfDocument doc = new PdfDocument();
        final int pageW = 595;
        final int pageH = 842;
        final float outerMargin = 26f;
        final float gap = 14f;
        final float headerBand = 34f;
        final int slots = Math.max(1, columns * rows);
        final int pageCount = (imagePaths.size() + slots - 1) / slots;

        Paint titlePaint = new Paint(Paint.ANTI_ALIAS_FLAG);
        titlePaint.setColor(Color.BLACK);
        titlePaint.setTextSize(16f);
        titlePaint.setFakeBoldText(true);

        Paint subPaint = new Paint(Paint.ANTI_ALIAS_FLAG);
        subPaint.setColor(Color.DKGRAY);
        subPaint.setTextSize(10f);

        Paint cardFill = new Paint(Paint.ANTI_ALIAS_FLAG);
        cardFill.setColor(Color.WHITE);

        Paint borderPaint = new Paint(Paint.ANTI_ALIAS_FLAG);
        borderPaint.setStyle(Paint.Style.STROKE);
        borderPaint.setStrokeWidth(1.4f);
        borderPaint.setColor(Color.rgb(160, 170, 185));

        Paint guidePaint = new Paint(Paint.ANTI_ALIAS_FLAG);
        guidePaint.setStyle(Paint.Style.STROKE);
        guidePaint.setStrokeWidth(1.3f);
        guidePaint.setColor(Color.rgb(105, 115, 130));

        Paint indexPaint = new Paint(Paint.ANTI_ALIAS_FLAG);
        indexPaint.setColor(Color.rgb(70, 80, 92));
        indexPaint.setTextSize(9f);

        for (int pageIndex = 0; pageIndex < pageCount; pageIndex++) {
            PdfDocument.PageInfo info = new PdfDocument.PageInfo.Builder(pageW, pageH, pageIndex + 1).create();
            PdfDocument.Page page = doc.startPage(info);
            Canvas canvas = page.getCanvas();
            canvas.drawColor(Color.WHITE);

            String safeTitle = title == null || title.trim().isEmpty() ? "ProScan AI ID Sheet" : title.trim();
            canvas.drawText(safeTitle, outerMargin, outerMargin - 6f + 16f, titlePaint);
            canvas.drawText("Layout: " + columns + " x " + rows + "    Page " + (pageIndex + 1) + " / " + pageCount,
                    outerMargin, outerMargin + 14f, subPaint);

            float gridTop = outerMargin + headerBand;
            float usableW = pageW - outerMargin * 2f;
            float usableH = pageH - gridTop - outerMargin;
            float cellW = (usableW - gap * (columns - 1)) / columns;
            float cellH = (usableH - gap * (rows - 1)) / rows;

            for (int slot = 0; slot < slots; slot++) {
                int itemIndex = pageIndex * slots + slot;
                if (itemIndex >= imagePaths.size()) break;
                int row = slot / columns;
                int col = slot % columns;
                float left = outerMargin + col * (cellW + gap);
                float top = gridTop + row * (cellH + gap);
                RectF cell = new RectF(left, top, left + cellW, top + cellH);
                RectF cardRect = fitAspect(cell, ID_CARD_ASPECT, 8f);

                Bitmap bmp = ImageUtils.decodeScaled(imagePaths.get(itemIndex), 1400);
                if (bmp == null) continue;

                RectF dst = fitInside(cardRect, bmp.getWidth(), bmp.getHeight(), 0f);
                canvas.drawRect(cardRect, cardFill);
                canvas.drawBitmap(bmp, null, dst, null);
                canvas.drawRect(cardRect, borderPaint);
                drawCutGuides(canvas, cardRect, guidePaint, 8f);
                canvas.drawText("Card " + (itemIndex + 1), cardRect.left, cardRect.bottom + 11f, indexPaint);
                bmp.recycle();
            }

            doc.finishPage(page);
        }

        File out = new File(
                AppStorage.ensureDir(new File(context.getCacheDir(), "exports")),
                sanitize(title == null || title.trim().isEmpty() ? "ProScanAI_ID_Sheet" : title.trim())
                        + "_idsheet_" + columns + "x" + rows + "_" + System.currentTimeMillis() + ".pdf"
        );
        FileOutputStream fos = new FileOutputStream(out);
        doc.writeTo(fos);
        fos.flush();
        fos.close();
        doc.close();
        return out;
    }

    private static RectF fitAspect(RectF outer, float aspect, float padding) {
        float maxW = outer.width() - padding * 2f;
        float maxH = outer.height() - padding * 2f;
        float width = maxW;
        float height = width / aspect;
        if (height > maxH) {
            height = maxH;
            width = height * aspect;
        }
        float left = outer.left + (outer.width() - width) / 2f;
        float top = outer.top + (outer.height() - height) / 2f;
        return new RectF(left, top, left + width, top + height);
    }

    private static RectF fitInside(RectF outer, int srcW, int srcH, float padding) {
        float maxW = outer.width() - padding * 2f;
        float maxH = outer.height() - padding * 2f;
        float scale = Math.min(maxW / srcW, maxH / srcH);
        float width = srcW * scale;
        float height = srcH * scale;
        float left = outer.left + (outer.width() - width) / 2f;
        float top = outer.top + (outer.height() - height) / 2f;
        return new RectF(left, top, left + width, top + height);
    }

    private static void drawCutGuides(Canvas canvas, RectF rect, Paint paint, float len) {
        // top-left
        canvas.drawLine(rect.left - len, rect.top, rect.left - 2f, rect.top, paint);
        canvas.drawLine(rect.left, rect.top - len, rect.left, rect.top - 2f, paint);
        // top-right
        canvas.drawLine(rect.right + 2f, rect.top, rect.right + len, rect.top, paint);
        canvas.drawLine(rect.right, rect.top - len, rect.right, rect.top - 2f, paint);
        // bottom-left
        canvas.drawLine(rect.left - len, rect.bottom, rect.left - 2f, rect.bottom, paint);
        canvas.drawLine(rect.left, rect.bottom + 2f, rect.left, rect.bottom + len, paint);
        // bottom-right
        canvas.drawLine(rect.right + 2f, rect.bottom, rect.right + len, rect.bottom, paint);
        canvas.drawLine(rect.right, rect.bottom + 2f, rect.right, rect.bottom + len, paint);
    }

    private static String sanitize(String text) {
        return text.replaceAll("[^a-zA-Z0-9._-]+", "_");
    }
}
