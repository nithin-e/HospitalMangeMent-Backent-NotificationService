import { CancelDoctorApplicationInput, CancelDoctorApplicationOutput } from "../implementation/handleCanceldoctorApplicationRepo";



export interface ICancelDoctorApplicationRepository {
  handleCancelDoctorApplication(
    data: CancelDoctorApplicationInput
  ): Promise<CancelDoctorApplicationOutput>;
}