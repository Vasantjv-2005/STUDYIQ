import type { Request, Response, NextFunction, RequestHandler } from "express";
import multer from "multer";
import path from "node:path";
import fs from "node:fs";
import crypto from "node:crypto";

import { env } from "../config/env.js";
import { ApiError } from "../utils/ApiError.js";
import { PDF_MAGIC_BYTES } from "../utils/constants.js";

// Ensure secure uploads directory exists outside publicly exposed assets
const UPLOAD_ROOT = path.resolve(process.cwd(), env.UPLOAD_DIR || "uploads", "documents");

if (!fs.existsSync(UPLOAD_ROOT)) {
    fs.mkdirSync(UPLOAD_ROOT, { recursive: true });
}

// Multer disk storage with randomized filenames
const storage = multer.diskStorage({
    destination: (_req, _file, cb) => {
        cb(null, UPLOAD_ROOT);
    },
    filename: (_req, file, cb) => {
        // Safe randomized server-side filename with strict .pdf extension
        const uniqueId = crypto.randomUUID();
        const timestamp = Date.now();
        const safeName = `${timestamp}-${uniqueId}.pdf`;
        cb(null, safeName);
    },
});

// Preliminary MIME and extension filter
const fileFilter = (
    _req: Request,
    file: Express.Multer.File,
    cb: multer.FileFilterCallback
) => {
    const isMimePdf = file.mimetype === "application/pdf";
    const isExtPdf = path.extname(file.originalname).toLowerCase() === ".pdf";

    if (isMimePdf && isExtPdf) {
        cb(null, true);
    } else {
        cb(
            ApiError.badRequest(
                "Invalid file type. Only authentic PDF documents (.pdf) are permitted."
            )
        );
    }
};

const maxSizeBytes = (env.MAX_FILE_SIZE_MB || 50) * 1024 * 1024;

const multerInstance = multer({
    storage,
    fileFilter,
    limits: {
        fileSize: maxSizeBytes,
        files: 1,
    },
});

/**
 * Validates the actual magic bytes of the saved file to ensure
 * it is a genuine PDF file and not an executable or disguise.
 */
const verifyPdfMagicBytes = async (filePath: string): Promise<boolean> => {
    let fileHandle: fs.promises.FileHandle | null = null;
    try {
        fileHandle = await fs.promises.open(filePath, "r");
        const buffer = Buffer.alloc(5);
        await fileHandle.read(buffer, 0, 5, 0);
        return buffer.toString("ascii") === PDF_MAGIC_BYTES;
    } catch {
        return false;
    } finally {
        if (fileHandle) {
            await fileHandle.close().catch(() => undefined);
        }
    }
};

// Accept either "file" or "document" field name
const uploadFields = multerInstance.fields([
    { name: "file", maxCount: 1 },
    { name: "document", maxCount: 1 },
]);

/**
 * Secure PDF upload middleware.
 *
 * Responsibilities:
 * 1. Safely stores file with random server-side filename in private storage.
 * 2. Enforces maximum file size and single-file limit.
 * 3. Inspects magic bytes (%PDF-) to reject disguised or corrupt binaries.
 * 4. Automatically removes rejected files from disk.
 * 5. Passes clean errors to centralized error handling.
 */
export const uploadDocumentFile: RequestHandler = (
    req: Request,
    res: Response,
    next: NextFunction
): void => {
    uploadFields(req, res, async (err: unknown) => {
        if (err) {
            next(err);
            return;
        }

        // Normalize req.file from multer fields
        const files = req.files as { [fieldname: string]: Express.Multer.File[] } | undefined;
        if (files) {
            if (files["file"] && files["file"].length > 0 && files["file"][0]) {
                req.file = files["file"][0];
            } else if (files["document"] && files["document"].length > 0 && files["document"][0]) {
                req.file = files["document"][0];
            }
        }

        if (!req.file) {
            next(ApiError.badRequest("Please attach a PDF document using field 'file' or 'document'."));
            return;
        }

        // Validate actual PDF file signature
        const isValidSignature = await verifyPdfMagicBytes(req.file.path);

        if (!isValidSignature) {
            // Delete corrupt or spoofed file immediately
            await fs.promises.unlink(req.file.path).catch(() => undefined);
            next(
                ApiError.badRequest(
                    "Invalid file content. The uploaded file is not a valid PDF document."
                )
            );
            return;
        }

        next();
    });
};

