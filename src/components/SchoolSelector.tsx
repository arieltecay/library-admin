import { useEffect, useState } from "react";
import api from "../api/client";
import { useToast } from "../hooks/useToast";

interface School {
  id: string;
  name: string;
  code: string;
  active: boolean;
}

export default function SchoolSelector({ onSchoolChange }: { onSchoolChange: (schoolId: string) => void }) {
  const [schools, setSchools] = useState<School[]>([]);
  const [selectedSchoolId, setSelectedSchoolId] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const { success, error: showError } = useToast();

  useEffect(() => {
    const savedSchoolId = localStorage.getItem("selectedSchoolId");
    if (savedSchoolId) {
      setSelectedSchoolId(savedSchoolId);
    }
    loadSchools();
  }, []);

  async function loadSchools() {
    try {
      const { data } = await api.get("/schools");
      setSchools(data.items || data);
      if (data.items?.[0] && !selectedSchoolId) {
        setSelectedSchoolId(data.items[0].id);
        localStorage.setItem("selectedSchoolId", data.items[0].id);
      }
    } catch (err: any) {
      showError(err.response?.data?.message || "Error cargando escuelas");
    } finally {
      setLoading(false);
    }
  }

  function handleChange(schoolId: string) {
    setSelectedSchoolId(schoolId);
    localStorage.setItem("selectedSchoolId", schoolId);
    onSchoolChange(schoolId);
    success(`Escuela cambiada a ${schools.find(s => s.id === schoolId)?.name}`);
  }

  if (loading || schools.length === 0) {
    return (
      <div className="flex items-center gap-2 px-3 py-1.5 bg-neutral-100 rounded-lg">
        <div className="w-24 h-5 bg-neutral-200 rounded animate-pulse"></div>
      </div>
    );
  }

  return (
    <div className="relative">
      <select
        value={selectedSchoolId}
        onChange={(e) => handleChange(e.target.value)}
        className="px-3 py-1.5 pr-8 bg-white border border-neutral-200 rounded-lg text-sm font-medium text-neutral-700 focus:border-primary-500 focus:outline-none appearance-none cursor-pointer"
      >
        {schools
          .filter(s => s.active)
          .map((school) => (
            <option key={school.id} value={school.id}>
              {school.name} ({school.code})
            </option>
          ))}
      </select>
      <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none">
        <svg className="w-4 h-4 text-neutral-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </div>
    </div>
  );
}