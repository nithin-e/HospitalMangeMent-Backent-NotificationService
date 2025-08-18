import { CancelDoctorApplicationInput, CancelDoctorApplicationOutput } from "../implementation/handleCanceldoctorApplicationRepo";

// export interface IhandleCanceldoctorApplicationRepository {
//   handleCanceldoctorApplication(data: CancelDoctorApplicationInput): Promise<CancelDoctorApplicationOutput>;
// }

export interface ICancelDoctorApplicationRepository {
  handleCancelDoctorApplication(
    data: CancelDoctorApplicationInput
  ): Promise<CancelDoctorApplicationOutput>;
}