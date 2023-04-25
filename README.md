# Moodle Course API

The Moodle-Course-API provides a read-only interface to easily 
query whether a user has completed a course, or a quiz. This can
be used in other applications (such as the Training-Center) to 
determine a member's progress within a specific course. 

## API Interface

| Method |        Path         | Parameters                             | Response                                                     | Description                                                                                                                              |
|:------:|:-------------------:|:---------------------------------------|:-------------------------------------------------------------|:-----------------------------------------------------------------------------------------------------------------------------------------|
| `GET`  | `/course_completed` | `{course_id: number, user_id: number}` | `{course_name: string, completed: bool, completed_at: Date}` | Returns the provided response for the provided parameters. Returns a `400` HTTP Error in the event of missing parameters.                |
| `GET`  |  `/quiz_completed`  | `{module_id: number, user_id: number}` | Result of the `SELECT` statement                             | Returns the result of the `SELECT` statement for the provided parameters. Returns a `400` HTTP Error in the event of missing parameters. |