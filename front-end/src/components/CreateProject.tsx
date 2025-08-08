import { useState } from "react";
import toast from "react-hot-toast";
import { motion } from "framer-motion";
import { createProject } from "../api/user";

interface CreateProjectProps {
  showCreateProject: boolean;
  setShowCreateProject: (show: boolean) => void;
}

const CreateProject = ({ setShowCreateProject }: CreateProjectProps) => {
  const [projectData, setProjectData] = useState({
    name: "",
    techStack: "react",
    createdAt: new Date(),
  });
  const [loading, setLoading] = useState(false);

  const handleCreateProject = async (e: React.FormEvent<HTMLFormElement>) => {
    try {
      setLoading(true);
      e.preventDefault();
      await createProject(projectData);
      toast.success("Project created");
      setShowCreateProject(false);
    } catch (error: any) {
      console.log(error);
      toast.error(error?.response.data.message);
    } finally {
      setLoading(false);
      document.body.style.overflow = "auto";
    }
  };
  return (
    <section className="fixed z-20 top-0 inset-0 left-0 w-screen flex justify-center backdrop-brightness-[0.2] items-center h-screen ">
      <motion.div
        className="rounded-xl shadow-md p-4 px-6 w-[40%] max-md:w-[95%] bg-gray-900"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <h2 className="text-3xl mb-7 flex justify-between">
          Create new project{" "}
          <span
            onClick={() => {
              document.body.style.overflow = "auto";
              setShowCreateProject(false);
            }}
            className="hover:text-gray-400 cursor-pointer"
          >
            X
          </span>
        </h2>
        <form
          onSubmit={handleCreateProject}
          className="flex flex-col gap-2 text-white justify-start"
        >
          <label htmlFor="name">Project name:</label>
          <input
            className="rounded-full px-4 py-2 text-md bg-gray-800"
            type="text"
            name="name"
            id="name"
            value={projectData.name}
            onChange={(e) =>
              setProjectData({ ...projectData, name: e.target.value })
            }
            required
          />
          <label htmlFor="techStack">Choose tech stack:</label>
          <select
            className="rounded-full px-3 py-3 text-md bg-gray-800"
            name="techStack"
            id="techStack"
            value={projectData.techStack}
            onChange={(e) =>
              setProjectData({ ...projectData, techStack: e.target.value })
            }
            required
          >
            <option value="react">React</option>
            <option value="node">Node</option>
            <option value="express">Express</option>
            {/* <option value="mern">MERN</option> */}
            <option value="nextjs">NextJS</option>
          </select>
          <button
            type="submit"
            disabled={loading}
            className="rounded-full py-2 gradient hover:contrast-150 my-4"
          >
            {loading ? (
              <img
                width={30}
                className="mx-auto animate-spin invert"
                src="/loader.png"
              />
            ) : (
              "Create"
            )}
          </button>
        </form>
      </motion.div>
    </section>
  );
};

export default CreateProject;
