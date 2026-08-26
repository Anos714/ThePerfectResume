import axios from "axios";
import { useForm, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const api = axios.create({
  baseURL: "http://localhost:8080",
  withCredentials: true,
});

const registerSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 6 characters"),
  confirmPassword: z
    .string()
    .min(8, "Confirm password must be at least 6 characters"),
});

type RegisterInput = z.infer<typeof registerSchema>;

function App() {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit: SubmitHandler<RegisterInput> = (data) => {
    api
      .post("api/v1/users/register", data)
      .then((res) => {
        console.log(res);
        reset();
      })
      .catch((err) => {
        console.error(err);
      });
  };

  return (
    <div>
      <form onSubmit={handleSubmit(onSubmit)}>
        <input
          type="text"
          name="username"
          id="username"
          placeholder="username"
          {...register("username")}
        />
        {errors.username && <p>{errors.username.message}</p>}
        <input
          type="email"
          name="email"
          id="email"
          {...register("email")}
          placeholder="email"
        />
        {errors.email && <p>{errors.email.message}</p>}
        <input
          type="password"
          name="password"
          id="password"
          placeholder="password"
          {...register("password")}
        />
        {errors.password && <p>{errors.password.message}</p>}

        <input
          type="password"
          name="confirmPassword"
          id="confirmPassword"
          placeholder="confirm password"
          {...register("confirmPassword")}
        />
        {errors.confirmPassword && <p>{errors.confirmPassword.message}</p>}
        <input
          type="submit"
          value={isSubmitting ? "Signing Up..." : "Sign Up"}
          disabled={isSubmitting}
        />
      </form>
    </div>
  );
}

export default App;
