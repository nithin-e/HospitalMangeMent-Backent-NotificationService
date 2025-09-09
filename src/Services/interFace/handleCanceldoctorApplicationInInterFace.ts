import { ServiceCancelDoctorApplicationInput, ServiceCancelDoctorApplicationOutput } from "../implementation/handleCanceldoctorApplicationInService";



export interface ICancelDoctorApplicationService {
  handleCancelDoctorApplication(
    data: ServiceCancelDoctorApplicationInput
  ): Promise<ServiceCancelDoctorApplicationOutput>;
}