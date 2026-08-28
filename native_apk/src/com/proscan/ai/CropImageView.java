package com.proscan.ai;

import android.content.Context;
import android.graphics.Bitmap;
import android.graphics.Canvas;
import android.graphics.Color;
import android.graphics.Paint;
import android.graphics.Path;
import android.graphics.PointF;
import android.graphics.RectF;
import android.view.MotionEvent;
import android.view.View;

public class CropImageView extends View {
    private Bitmap bitmap;
    private final Paint linePaint = new Paint(Paint.ANTI_ALIAS_FLAG);
    private final Paint handlePaint = new Paint(Paint.ANTI_ALIAS_FLAG);
    private final Paint dimPaint = new Paint(Paint.ANTI_ALIAS_FLAG);
    private final PointF[] corners = new PointF[]{
            new PointF(0.08f, 0.08f),
            new PointF(0.92f, 0.08f),
            new PointF(0.92f, 0.92f),
            new PointF(0.08f, 0.92f)
    };
    private final RectF imageRect = new RectF();
    private int activeHandle = -1;

    public CropImageView(Context context) {
        super(context);
        linePaint.setColor(Color.argb(255, 47, 107, 255));
        linePaint.setStyle(Paint.Style.STROKE);
        linePaint.setStrokeWidth(5f);
        handlePaint.setColor(Color.WHITE);
        handlePaint.setStyle(Paint.Style.FILL);
        dimPaint.setColor(Color.argb(110, 0, 0, 0));
    }

    public void setBitmap(Bitmap bitmap) {
        this.bitmap = bitmap;
        invalidate();
    }

    public PointF[] getImageCorners() {
        if (bitmap == null) return new PointF[0];
        PointF[] out = new PointF[4];
        for (int i = 0; i < 4; i++) {
            out[i] = new PointF(corners[i].x * bitmap.getWidth(), corners[i].y * bitmap.getHeight());
        }
        return out;
    }

    @Override
    protected void onDraw(Canvas canvas) {
        super.onDraw(canvas);
        if (bitmap == null) return;
        computeRect();
        canvas.drawColor(Color.BLACK);
        canvas.drawBitmap(bitmap, null, imageRect, null);

        Path quad = new Path();
        float x0 = imageRect.left + corners[0].x * imageRect.width();
        float y0 = imageRect.top + corners[0].y * imageRect.height();
        quad.moveTo(x0, y0);
        for (int i = 1; i < 4; i++) {
            quad.lineTo(imageRect.left + corners[i].x * imageRect.width(), imageRect.top + corners[i].y * imageRect.height());
        }
        quad.close();

        Path outer = new Path();
        outer.addRect(0, 0, getWidth(), getHeight(), Path.Direction.CW);
        outer.op(quad, Path.Op.DIFFERENCE);
        canvas.drawPath(outer, dimPaint);
        canvas.drawPath(quad, linePaint);

        for (int i = 0; i < 4; i++) {
            float cx = imageRect.left + corners[i].x * imageRect.width();
            float cy = imageRect.top + corners[i].y * imageRect.height();
            canvas.drawCircle(cx, cy, 16f, handlePaint);
            canvas.drawCircle(cx, cy, 20f, linePaint);
        }
    }

    private void computeRect() {
        float vw = getWidth();
        float vh = getHeight();
        float bw = bitmap.getWidth();
        float bh = bitmap.getHeight();
        float scale = Math.min(vw / bw, vh / bh);
        float dw = bw * scale;
        float dh = bh * scale;
        imageRect.set((vw - dw) / 2f, (vh - dh) / 2f, (vw + dw) / 2f, (vh + dh) / 2f);
    }

    @Override
    public boolean onTouchEvent(MotionEvent event) {
        if (bitmap == null) return false;
        computeRect();
        switch (event.getActionMasked()) {
            case MotionEvent.ACTION_DOWN:
                activeHandle = nearestHandle(event.getX(), event.getY());
                return activeHandle >= 0;
            case MotionEvent.ACTION_MOVE:
                if (activeHandle >= 0) {
                    float nx = (event.getX() - imageRect.left) / imageRect.width();
                    float ny = (event.getY() - imageRect.top) / imageRect.height();
                    corners[activeHandle].x = clamp(nx, 0.02f, 0.98f);
                    corners[activeHandle].y = clamp(ny, 0.02f, 0.98f);
                    invalidate();
                    return true;
                }
                break;
            case MotionEvent.ACTION_UP:
            case MotionEvent.ACTION_CANCEL:
                activeHandle = -1;
                return true;
        }
        return super.onTouchEvent(event);
    }

    private int nearestHandle(float x, float y) {
        int hit = -1;
        double best = 40 * 40;
        for (int i = 0; i < 4; i++) {
            float cx = imageRect.left + corners[i].x * imageRect.width();
            float cy = imageRect.top + corners[i].y * imageRect.height();
            double dx = x - cx;
            double dy = y - cy;
            double d = dx * dx + dy * dy;
            if (d < best) {
                best = d;
                hit = i;
            }
        }
        return hit;
    }

    private float clamp(float value, float min, float max) {
        return Math.max(min, Math.min(max, value));
    }
}
