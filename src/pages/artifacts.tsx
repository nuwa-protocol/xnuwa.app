import { ArtifactMain } from "@/features/artifacts/components";
import { ChatProvider } from "@/features/chat/contexts/chat-context";

export default function ArtifactsPage() {
    return (
        <ChatProvider>
            <ArtifactMain />
        </ChatProvider>
    )
}