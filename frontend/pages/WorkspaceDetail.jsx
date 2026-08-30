import { useParams } from "react-router-dom";
import Sidebar from "../components/Sidebar";

export default function WorkspaceDetail(){
    const { id } = useParams();
    const items = [
    { label: "Projects", path: "/" },
    { label: "Activity Log", path: "/" },
    { label: "Members", path: "/" },
    { label: "Settings", path: "/" },
  ];
    return(
        <>
        <div className="flex min-h-screen">
            <Sidebar items={items}></Sidebar>
            
        </div>
        </>
    )
}