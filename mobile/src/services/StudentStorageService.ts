import * as SecureStore from "expo-secure-store";

const STUDENT_ID_KEY = "student_id";

export class StudentStorageService {
  static async saveStudentId(id: string): Promise<void> {
    await SecureStore.setItemAsync(STUDENT_ID_KEY, id);
  }

  static async getStudentId(): Promise<string | null> {
    return await SecureStore.getItemAsync(STUDENT_ID_KEY);
  }

  static async clearStudentId(): Promise<void> {
    await SecureStore.deleteItemAsync(STUDENT_ID_KEY);
  }
}
