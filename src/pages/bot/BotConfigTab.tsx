import { BotSection } from "./BotSection";
import { StatusMessagesSection } from "./StatusMessagesSection";

const BotConfigTab = () => (
  <div className="max-w-4xl space-y-6">
    <BotSection onToast={() => undefined} />
    <StatusMessagesSection />
  </div>
);

export default BotConfigTab;
