package com.proscan.ai;

import android.graphics.Bitmap;
import android.graphics.BitmapFactory;
import android.graphics.Color;
import android.graphics.PointF;

public class ImageUtils {
    public static final int FILTER_ORIGINAL = 0;
    public static final int FILTER_MAGIC = 1;
    public static final int FILTER_BW = 2;
    public static final int FILTER_GRAY = 3;

    public static Bitmap decodeScaled(String path, int maxDim) {
        try {
            BitmapFactory.Options bounds = new BitmapFactory.Options();
            bounds.inJustDecodeBounds = true;
            BitmapFactory.decodeFile(path, bounds);
            int sample = 1;
            while (Math.max(bounds.outWidth / sample, bounds.outHeight / sample) > maxDim) {
                sample *= 2;
            }
            BitmapFactory.Options opts = new BitmapFactory.Options();
            opts.inSampleSize = Math.max(1, sample);
            opts.inPreferredConfig = Bitmap.Config.ARGB_8888;
            Bitmap bmp = BitmapFactory.decodeFile(path, opts);
            if (bmp == null) return null;
            int longest = Math.max(bmp.getWidth(), bmp.getHeight());
            if (longest > maxDim) {
                float scale = maxDim / (float) longest;
                int w = Math.max(1, Math.round(bmp.getWidth() * scale));
                int h = Math.max(1, Math.round(bmp.getHeight() * scale));
                bmp = Bitmap.createScaledBitmap(bmp, w, h, true);
            }
            return bmp.copy(Bitmap.Config.ARGB_8888, true);
        } catch (Throwable t) {
            return null;
        }
    }

    public static Bitmap rotate(Bitmap src, int quarterTurns) {
        int turns = ((quarterTurns % 4) + 4) % 4;
        if (turns == 0) return src;
        android.graphics.Matrix matrix = new android.graphics.Matrix();
        matrix.postRotate(turns * 90f);
        return Bitmap.createBitmap(src, 0, 0, src.getWidth(), src.getHeight(), matrix, true);
    }

    public static Bitmap applyFilter(Bitmap src, int preset, boolean autoEnhance, float brightness, float contrast, float saturation) {
        int w = src.getWidth();
        int h = src.getHeight();
        int[] px = new int[w * h];
        src.getPixels(px, 0, w, 0, 0, w, h);

        double avgR = 0, avgG = 0, avgB = 0;
        double minL = 255, maxL = 0;
        for (int c : px) {
            int r = Color.red(c);
            int g = Color.green(c);
            int b = Color.blue(c);
            avgR += r;
            avgG += g;
            avgB += b;
            double lum = 0.299 * r + 0.587 * g + 0.114 * b;
            if (lum < minL) minL = lum;
            if (lum > maxL) maxL = lum;
        }
        double n = Math.max(1, px.length);
        avgR /= n;
        avgG /= n;
        avgB /= n;
        double gray = (avgR + avgG + avgB) / 3.0;
        double rs = gray / Math.max(1.0, avgR);
        double gs = gray / Math.max(1.0, avgG);
        double bs = gray / Math.max(1.0, avgB);
        double range = Math.max(1.0, maxL - minL);

        int threshold = 150;
        if (preset == FILTER_BW) {
            int[] hist = new int[256];
            for (int c : px) {
                int l = (int) Math.round(0.299 * Color.red(c) + 0.587 * Color.green(c) + 0.114 * Color.blue(c));
                hist[Math.max(0, Math.min(255, l))]++;
            }
            threshold = otsu(hist, px.length);
        }

        for (int i = 0; i < px.length; i++) {
            int c = px[i];
            int a = Color.alpha(c);
            double r = Color.red(c);
            double g = Color.green(c);
            double b = Color.blue(c);

            if (preset == FILTER_MAGIC) {
                r = (((r * rs) - minL) * 255.0 / range) + 8.0;
                g = (((g * gs) - minL) * 255.0 / range) + 8.0;
                b = (((b * bs) - minL) * 255.0 / range) + 8.0;
                double[] sat = applySaturation(r, g, b, 1.12);
                r = sat[0]; g = sat[1]; b = sat[2];
            } else if (preset == FILTER_GRAY) {
                double l = 0.299 * r + 0.587 * g + 0.114 * b;
                r = g = b = l;
            } else if (preset == FILTER_BW) {
                double l = 0.299 * r + 0.587 * g + 0.114 * b;
                r = g = b = l >= threshold ? 255 : 0;
            }

            if (autoEnhance) {
                r = applyContrast(r + 6, 18);
                g = applyContrast(g + 6, 18);
                b = applyContrast(b + 6, 18);
                double[] sat = applySaturation(r, g, b, 1.16);
                r = sat[0]; g = sat[1]; b = sat[2];
            }

            if (brightness != 0 || contrast != 0 || saturation != 100) {
                r = applyContrast(r + brightness, contrast);
                g = applyContrast(g + brightness, contrast);
                b = applyContrast(b + brightness, contrast);
                double[] sat = applySaturation(r, g, b, saturation / 100.0);
                r = sat[0]; g = sat[1]; b = sat[2];
            }

            px[i] = Color.argb(a, clamp(r), clamp(g), clamp(b));
        }

        Bitmap out = Bitmap.createBitmap(w, h, Bitmap.Config.ARGB_8888);
        out.setPixels(px, 0, w, 0, 0, w, h);
        return out;
    }

    private static int otsu(int[] hist, int total) {
        double sum = 0;
        for (int i = 0; i < 256; i++) sum += i * hist[i];
        double sumB = 0;
        int wB = 0;
        int threshold = 140;
        double max = 0;
        for (int i = 0; i < 256; i++) {
            wB += hist[i];
            if (wB == 0) continue;
            int wF = total - wB;
            if (wF == 0) break;
            sumB += i * hist[i];
            double mB = sumB / wB;
            double mF = (sum - sumB) / wF;
            double var = (double) wB * wF * (mB - mF) * (mB - mF);
            if (var > max) {
                max = var;
                threshold = i;
            }
        }
        return threshold;
    }

    private static double applyContrast(double value, double contrast) {
        if (contrast == 0) return value;
        double factor = (259 * (contrast + 255)) / (255 * (259 - contrast));
        return factor * (value - 128) + 128;
    }

    private static double[] applySaturation(double r, double g, double b, double scale) {
        double gray = 0.299 * r + 0.587 * g + 0.114 * b;
        return new double[]{gray + (r - gray) * scale, gray + (g - gray) * scale, gray + (b - gray) * scale};
    }

    private static int clamp(double value) {
        return (int) Math.max(0, Math.min(255, Math.round(value)));
    }

    public static Bitmap cropQuad(Bitmap src, PointF[] quad) {
        double wTop = distance(quad[0], quad[1]);
        double wBottom = distance(quad[3], quad[2]);
        double hLeft = distance(quad[0], quad[3]);
        double hRight = distance(quad[1], quad[2]);
        int outW = Math.max(64, Math.min(2200, (int) Math.round((wTop + wBottom) * 0.5)));
        int outH = Math.max(64, Math.min(2200, (int) Math.round((hLeft + hRight) * 0.5)));

        double[] m = solveHomography(
                new double[]{0, 0, outW - 1, 0, outW - 1, outH - 1, 0, outH - 1},
                new double[]{quad[0].x, quad[0].y, quad[1].x, quad[1].y, quad[2].x, quad[2].y, quad[3].x, quad[3].y}
        );

        Bitmap out = Bitmap.createBitmap(outW, outH, Bitmap.Config.ARGB_8888);
        int[] pixels = new int[outW * outH];
        for (int y = 0; y < outH; y++) {
            for (int x = 0; x < outW; x++) {
                double denom = m[6] * x + m[7] * y + 1.0;
                double sx = (m[0] * x + m[1] * y + m[2]) / denom;
                double sy = (m[3] * x + m[4] * y + m[5]) / denom;
                pixels[y * outW + x] = sampleBilinear(src, sx, sy);
            }
        }
        out.setPixels(pixels, 0, outW, 0, 0, outW, outH);
        return out;
    }

    private static int sampleBilinear(Bitmap src, double x, double y) {
        int w = src.getWidth();
        int h = src.getHeight();
        x = Math.max(0, Math.min(w - 1.001, x));
        y = Math.max(0, Math.min(h - 1.001, y));
        int x0 = (int) Math.floor(x);
        int y0 = (int) Math.floor(y);
        int x1 = Math.min(w - 1, x0 + 1);
        int y1 = Math.min(h - 1, y0 + 1);
        double dx = x - x0;
        double dy = y - y0;
        int c00 = src.getPixel(x0, y0);
        int c10 = src.getPixel(x1, y0);
        int c01 = src.getPixel(x0, y1);
        int c11 = src.getPixel(x1, y1);
        int a = bilerp(Color.alpha(c00), Color.alpha(c10), Color.alpha(c01), Color.alpha(c11), dx, dy);
        int r = bilerp(Color.red(c00), Color.red(c10), Color.red(c01), Color.red(c11), dx, dy);
        int g = bilerp(Color.green(c00), Color.green(c10), Color.green(c01), Color.green(c11), dx, dy);
        int b = bilerp(Color.blue(c00), Color.blue(c10), Color.blue(c01), Color.blue(c11), dx, dy);
        return Color.argb(a, r, g, b);
    }

    private static int bilerp(int c00, int c10, int c01, int c11, double dx, double dy) {
        double top = c00 + (c10 - c00) * dx;
        double bottom = c01 + (c11 - c01) * dx;
        return clamp(top + (bottom - top) * dy);
    }

    private static double distance(PointF a, PointF b) {
        double dx = a.x - b.x;
        double dy = a.y - b.y;
        return Math.sqrt(dx * dx + dy * dy);
    }

    private static double[] solveHomography(double[] srcRect, double[] dstQuad) {
        double[][] A = new double[8][8];
        double[] B = new double[8];
        for (int i = 0; i < 4; i++) {
            double x = srcRect[i * 2];
            double y = srcRect[i * 2 + 1];
            double X = dstQuad[i * 2];
            double Y = dstQuad[i * 2 + 1];
            int r = i * 2;
            A[r][0] = x; A[r][1] = y; A[r][2] = 1; A[r][3] = 0; A[r][4] = 0; A[r][5] = 0; A[r][6] = -x * X; A[r][7] = -y * X;
            B[r] = X;
            A[r + 1][0] = 0; A[r + 1][1] = 0; A[r + 1][2] = 0; A[r + 1][3] = x; A[r + 1][4] = y; A[r + 1][5] = 1; A[r + 1][6] = -x * Y; A[r + 1][7] = -y * Y;
            B[r + 1] = Y;
        }
        return gaussianSolve(A, B);
    }

    private static double[] gaussianSolve(double[][] A, double[] B) {
        int n = 8;
        for (int p = 0; p < n; p++) {
            int max = p;
            for (int i = p + 1; i < n; i++) if (Math.abs(A[i][p]) > Math.abs(A[max][p])) max = i;
            double[] temp = A[p]; A[p] = A[max]; A[max] = temp;
            double t = B[p]; B[p] = B[max]; B[max] = t;
            double pivot = A[p][p];
            if (Math.abs(pivot) < 1e-9) pivot = 1e-9;
            for (int j = p; j < n; j++) A[p][j] /= pivot;
            B[p] /= pivot;
            for (int i = 0; i < n; i++) {
                if (i == p) continue;
                double factor = A[i][p];
                for (int j = p; j < n; j++) A[i][j] -= factor * A[p][j];
                B[i] -= factor * B[p];
            }
        }
        return new double[]{B[0], B[1], B[2], B[3], B[4], B[5], B[6], B[7]};
    }
}
