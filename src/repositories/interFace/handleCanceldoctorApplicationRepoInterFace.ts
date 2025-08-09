import { CancelDoctorApplicationInput, CancelDoctorApplicationOutput } from "../implementation/handleCanceldoctorApplicationRepo";

export interface IhandleCanceldoctorApplicationRepository {
  handleCanceldoctorApplication(data: CancelDoctorApplicationInput): Promise<CancelDoctorApplicationOutput>;
}