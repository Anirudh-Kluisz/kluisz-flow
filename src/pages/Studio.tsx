import { StudioCanvas } from "@/components/studio/StudioCanvas";
import { StudioSidebar } from "@/components/studio/StudioSidebar";
import { StudioToolbar } from "@/components/studio/StudioToolbar";
import { StudioInspector } from "@/components/studio/StudioInspector";

const Studio = () => {
  return (
    <div className="flex h-screen bg-background text-foreground overflow-hidden">
      {/* Left Sidebar */}
      <StudioSidebar />
      
      {/* Main Content Area */}
      <div className="flex-1 flex flex-col">
        {/* Top Toolbar */}
        <StudioToolbar />
        
        {/* Canvas Area */}
        <div className="flex-1 flex">
          {/* Canvas */}
          <div className="flex-1">
            <StudioCanvas />
          </div>
          
          {/* Right Inspector */}
          <StudioInspector />
        </div>
      </div>
    </div>
  );
};

export default Studio;