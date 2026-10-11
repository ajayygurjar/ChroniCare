import { useSelector } from 'react-redux';

// The signed-in user's profile. It arrives with the session (login, signup or session restore),
// so there is nothing to fetch here.
export const useProfile = () => {
  const profile = useSelector((state) => state.auth.profile);
  return { profile, loading: false, error: null };
};
