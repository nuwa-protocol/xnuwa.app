import { CenteredWelcome } from './centered-welcome';
import { MultimodalInput } from './multimodal-input';

export function NewChat() {

    return (
        <div className="flex flex-col relative min-w-0 h-screen bg-background">
            <div className="flex flex-col w-full h-dvh bg-background">

                <CenteredWelcome>
                    <div className="w-full max-w-4xl space-y-6">
                        <div className="px-4">
                            <MultimodalInput />
                        </div>
                    </div>
                </CenteredWelcome>
            </div>
        </div>
    );
}