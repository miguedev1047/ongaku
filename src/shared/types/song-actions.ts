export type TSongAction = {
  code: "SUCCESS" | "ERROR" | "SAME_FILE" | "ALREADY_EXISTS"
  message: string
}
