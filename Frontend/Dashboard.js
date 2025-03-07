import { useRecoilState } from "recoil";
import { daoDataState } from "../context/GlobalState";
import { useEffect } from "react";

export default function Dashboard() {
  const [daoData, setDaoData] = useRecoilState(daoDataState);

  useEffect(() => {
    // TODO: Fetch DAO data from backend
    setDaoData({ name: "EliteDAO", members: 120, treasury: "350 SOL" });
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold">DAO Dashboard</h1>
      <p className="mt-2">Members: {daoData.members}</p>
      <p>Treasury: {daoData.treasury}</p>
    </div>
  );
}
