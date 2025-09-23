import {
  ServiceCancelDoctorApplicationInput,
  ServiceCancelDoctorApplicationOutput,
} from "interfaces/types";

export interface ICancelDoctorApplicationService {
  handleCancelDoctorApplication(
    data: ServiceCancelDoctorApplicationInput
  ): Promise<ServiceCancelDoctorApplicationOutput>;
}
