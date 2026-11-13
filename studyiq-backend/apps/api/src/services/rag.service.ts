import mongoose from "mongoose";

import Chapter, { type IChapter } from "../models/Chapter.model.js";
import Concept, { type IConcept } from "../models/Concept.model.js";
import type { IChatSource } from "../models/ChatMessage.model.js";

export interface RetrievedContext {
    sources: IChatSource[];
    contextExcerpts: string[];
}

export const retrieveTextbookContext = async (
    userId: string,
    documentId: string | undefined,
    userQuery: string
): Promise<RetrievedContext> => {
    if (!documentId || !mongoose.isValidObjectId(documentId)) {
        return { sources: [], contextExcerpts: [] };
    }

    const cleanTerms = userQuery
        .toLowerCase()
        .replace(/[^a-zA-Z0-9\s]/g, "")
        .split(/\s+/)
        .filter((w) => w.length > 2);

    const sources: IChatSource[] = [];
    const contextExcerpts: string[] = [];

    // Search concepts first for precise definitions
    const concepts = await Concept.find({
        document: documentId,
        user: userId,
        ...(cleanTerms.length > 0 && {
            $or: [
                { title: { $regex: cleanTerms.join("|"), $options: "i" } },
                { keywords: { $in: cleanTerms } },
            ],
        }),
    })
        .limit(3)
        .lean<IConcept[]>()
        .exec();

    for (const concept of concepts) {
        const excerpt = `Concept: ${concept.title}\nDifficulty: ${concept.difficulty}\nSummary: ${concept.description}${concept.explanation ? `\nExplanation: ${concept.explanation.slice(0, 500)}...` : ""}`;
        contextExcerpts.push(excerpt);

        sources.push({
            document: concept.document,
            chapter: concept.chapter,
            pageNumber: concept.pageReferences[0] ?? undefined,
            excerpt: concept.description.slice(0, 300),
        });
    }

    // Search chapter content for textbook paragraph context
    const chapters = await Chapter.find({
        document: documentId,
        user: userId,
        ...(cleanTerms.length > 0 && {
            $or: [
                { title: { $regex: cleanTerms.join("|"), $options: "i" } },
                { content: { $regex: cleanTerms.slice(0, 3).join("|"), $options: "i" } },
            ],
        }),
    })
        .limit(2)
        .lean<IChapter[]>()
        .exec();

    for (const chapter of chapters) {
        // Find best paragraph match in chapter content
        const paragraphs = chapter.content.split(/\n\s*\n/).filter((p) => p.trim().length > 50);
        let bestParagraph = paragraphs[0] ?? chapter.content.slice(0, 500);

        for (const p of paragraphs) {
            const matches = cleanTerms.filter((term) => p.toLowerCase().includes(term)).length;
            if (matches > 1) {
                bestParagraph = p;
                break;
            }
        }

        const excerpt = `Chapter ${chapter.chapterNumber}: ${chapter.title} (Pages ${chapter.startPage}-${chapter.endPage})\nExcerpt: ${bestParagraph.slice(0, 800)}`;
        contextExcerpts.push(excerpt);

        sources.push({
            document: chapter.document,
            chapter: chapter._id as mongoose.Types.ObjectId,
            pageNumber: chapter.startPage,
            excerpt: bestParagraph.slice(0, 300),
        });
    }

    return { sources, contextExcerpts };
};

