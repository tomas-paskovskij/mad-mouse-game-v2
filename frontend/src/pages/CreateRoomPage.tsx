import { useNavigate } from "react-router-dom";

const CreateRoomPage = () => {
  const navigate = useNavigate();

  return (
    <div className="max-w-md mx-auto mt-20 p-8 bg-slate-800 rounded-2xl border border-slate-700">
      <h2 className="text-2xl font-bold mb-6 text-center text-white">
        Create New Room
      </h2>

      <div className="space-y-4">
        <div>
          <label className="block text-xs font-bold text-slate-500 mb-1 uppercase ml-1">
            Room Name
          </label>
          <input
            type="text"
            placeholder="Mouse Trap #1"
            className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-green-500 outline-none"
          />
        </div>

        <div className="flex gap-4">
          <button
            onClick={() => navigate("/lobby")}
            className="flex-1 bg-slate-700 hover:bg-slate-600 py-3 rounded-lg font-bold"
          >
            Cancel
          </button>
          <button className="flex-1 bg-green-600 hover:bg-green-500 py-3 rounded-lg font-bold">
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateRoomPage;
