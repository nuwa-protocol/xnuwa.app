import { Separator } from "@/shared/components/ui";

// TODO: need to add a button to revert the context clear
export function ClearContextMessage() {
    return (
        <div className="max-w-2xl my-8 mx-auto flex items-center justify-center overflow-hidden">
            <Separator decorative={true} className=" border-t border-2 rounded-full bg-transparent" />
            <div className="px-4 text-center bg-card text-sm min-w-fit text-muted-foreground">Context Cleared</div>
            <Separator className="border-t border-2 rounded-full bg-transparent" />
        </div>
    );
}