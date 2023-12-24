export interface Post {
  id?: string
  title: string
  content: string
  userid: string // Assuming a post is associated with a user
  createdAt?: Date
  updatedAt?: Date
  // Add more properties as needed
}
