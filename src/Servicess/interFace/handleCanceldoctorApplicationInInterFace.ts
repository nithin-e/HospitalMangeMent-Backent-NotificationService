import { ServiceCancelDoctorApplicationInput, ServiceCancelDoctorApplicationOutput } from "../implementation/handleCanceldoctorApplicationInService";

export interface IhandleCanceldoctorApplicationService {
  handleCancelDoctorApplication(data: ServiceCancelDoctorApplicationInput): Promise<ServiceCancelDoctorApplicationOutput>;
}