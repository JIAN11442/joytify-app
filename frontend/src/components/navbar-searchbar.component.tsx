import { twMerge } from "tailwind-merge";
import { BiSearch } from "react-icons/bi";
import SearchBarInput from "./searchbar-input.component";

type SearchBarProps = {
  visible: boolean;
  autoCloseFn: { active: boolean; closeFn: () => void | null };
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  className?: string;
  tw?: { wrapper?: string; icon?: string };
};

const NavbarSearchBar: React.FC<SearchBarProps> = ({
  visible,
  autoCloseFn,
  onChange,
  className,
  tw,
}) => {
  return (
    <SearchBarInput
      id="navbar-searchbar"
      placeholder="What do you want to play?"
      visible={visible}
      icon={{ name: BiSearch, opts: { size: 22 } }}
      autoCloseFn={autoCloseFn}
      onChange={onChange}
      className={twMerge(`pl-12 text-[14px] rounded-full `, className)}
      tw={{
        wrapper: tw?.wrapper,
        icon: twMerge(`left-2.5 text-neutral-400 no-hover`, tw?.icon),
      }}
    />
  );
};

export default NavbarSearchBar;
