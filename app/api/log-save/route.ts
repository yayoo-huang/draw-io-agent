import { NextResponse } from "next/server"

export async function POST(request: Request) {
    try {
        const { filename, format, sessionId } = await request.json()

        // Log to console for debugging
        console.log("[log-save] Diagram saved:", {
            filename,
            format,
            sessionId,
            timestamp: new Date().toISOString(),
        })

        // TODO: Add Langfuse logging here if needed
        // This is just a placeholder for now

        return NextResponse.json({
            success: true,
            message: "Save event logged",
        })
    } catch (error) {
        console.error("[log-save] Error:", error)
        return NextResponse.json(
            { success: false, error: "Failed to log save event" },
            { status: 500 },
        )
    }
}
