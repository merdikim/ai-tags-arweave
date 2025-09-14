import { useEffect, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { allowedExtensions, readDocument } from "./utils";
import file_icon from "./assets/file.svg"

  const allowedMimes = [
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "text/markdown",
    "text/x-markdown",
    "text/plain"
  ];

function App() {

  const [message, setMessage] = useState('');
  const [text, setText] = useState('')
  const textareaRef = useRef(null);
  const [file, setFile] = useState<File | null>(null);


  const {data:tags, isLoading, error} = useQuery({
    queryKey: ['create-tags', text ],
    queryFn: async () => {
      if(!text) return {}
      const res = await fetch("https://45.56.119.30:9090/generate-tags", { method: "POST", headers: { "Content-Type": "application/json" }, body:JSON.stringify({text:message})})
      const data = await res.json()
      return data.tags || []
    }
  });

  const handleKeyDown = (e: { key: string; shiftKey: any; preventDefault: () => void; }) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      setText(message)
      //handleSend();
    }
  };


  const handleFileChange = async(e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return setFile(null);

    const ext = getExtension(selectedFile.name);
    const isValid =
      allowedExtensions.includes(ext) &&
      (allowedMimes.includes(selectedFile.type) || selectedFile.type === "");

    if (!isValid) {
      alert("Only PDF, Word (.doc/.docx), or Markdown (.md/.markdown) files are allowed.");
      e.target.value = ""; // reset invalid file
      setFile(null);
      return;
    }

    const fileText = await readDocument(selectedFile)
    setMessage(fileText || "")

    setFile(selectedFile);
    console.log("Accepted file:", selectedFile.name, selectedFile.type);
  };

  const getExtension = (name: string) => {
    const idx = name.lastIndexOf(".");
    return idx >= 0 ? name.slice(idx).toLowerCase() : "";
  };

  // Auto-resize textarea
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      //@ts-ignore
      textarea.style.height = 'auto';
      //@ts-ignore
      textarea.style.height = Math.min(textarea.scrollHeight, 160) + 'px';
    }
  }, [message]);

  return (
    <div className="flex h-screen flex-col items-center pt-20 gap-4 px-4">
      <h1 className="text-sm md:text-xl font-semibold mb-5 text-center">Create AI-powered tags for your text and documents</h1>
      <div className="max-w-[700px] min-h-[52px] max-h-[200px] flex items-center gap-2 md:gap-4 w-full border border-gray-300 rounded-lg p-4 overflow-auto">

        <div className="">

              <input type="file" accept=".pdf,application/pdf,.doc,.docx,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,.md,.markdown,text/markdown" name="file" id="file" onChange={handleFileChange} hidden/>
              <label htmlFor="file"><img src={file_icon} className="group-hover:rotate-90 cursor-pointer transition-transform duration-200" /></label>
        </div>
        <textarea
          name="text"
          ref={textareaRef}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Enter Your Text..."
          className="w-full border-none outline-none resize-none text-gray-900 placeholder-gray-500 text-sm md:text-base leading-6 h-full"
          rows={1}
        />
      </div>
      <p className="my-4 h-8">{file?.name}</p>
      <div className="w-full max-w-[700px] mt-6">
        <h3 className="font-semibold mb-10">Tags</h3>
        <div className="max-h-[400px] overflow-scroll">
          {(!isLoading && !error) && <pre>{JSON.stringify(tags, null, 2)}</pre>}
          {isLoading &&<i>Loading tags...</i>}
          {error &&<i>Something went wrong while generating tags. Try again later </i>}
        </div>
      </div>
    </div>
  )
}

export default App
