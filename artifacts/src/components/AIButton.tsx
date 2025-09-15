import "@blocknote/mantine/style.css";
import { useComponentsContext } from "@blocknote/react";

// Custom Formatting Toolbar Button to toggle blue text & background color.
export function AddSelectionButton({ onClick }: { onClick: () => void }) {
    const Components = useComponentsContext()!;

    return (
        <Components.FormattingToolbar.Button
            mainTooltip={"Add To Chat"}
            onClick={() => {
                onClick();
            }}
        >
            Add To Chat
        </Components.FormattingToolbar.Button>
    );
}


// Custom Formatting Toolbar Button to toggle blue text & background color.
export function ImproveWithAIButton({ onClick }: { onClick: () => void }) {
    const Components = useComponentsContext()!;

    return (
        <Components.FormattingToolbar.Button
            mainTooltip={"Improve With AI"}
            onClick={() => {
                onClick();
            }}
        >
            Improve With AI
        </Components.FormattingToolbar.Button>
    );
}
