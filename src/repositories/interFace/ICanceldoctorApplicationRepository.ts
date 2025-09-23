import {
  CancelDoctorApplicationInput,
  CancelDoctorApplicationOutput,
} from "interfaces/types";

export interface ICancelDoctorApplicationRepository {
  handleCancelDoctorApplication(
    data: CancelDoctorApplicationInput
  ): Promise<CancelDoctorApplicationOutput>;
}
