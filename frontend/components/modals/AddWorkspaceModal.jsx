export function WorkspaceModal(){
    const [name, setName] = useState("");

    return(
        <div className="bg-white rounded-md shadow-md w-28 h-28 flex flex-col">
            <div className="">
                <label htmlFor="name">Workspace name</label>
                <input type="text" name="name" />
            </div>
        </div>
    )
}