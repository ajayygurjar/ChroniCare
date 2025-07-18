
import PatientDashboard from "../components/Patient/PatientDashboard";
import DoctorDashboard from "../components/Doctor/DoctorDashboard";
import { useSelector } from "react-redux";
const Dashboard = () => {
    const {role}=useSelector((state)=>state.auth);
   if(role==='patient')return <PatientDashboard/>
   if(role==='doctor')return <DoctorDashboard/>
   
  return (
    <p>You are not authorized to view this page.</p>
  )
}

export default Dashboard