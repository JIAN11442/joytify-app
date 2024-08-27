import ContentBox from "./content-box.component";
import LibraryBody from "./library-body.component";
import LibraryHeader from "./library-header.component";
import useAuthHook from "../hooks/auth.hook";

const Library = () => {
  const { user, isLoading, isFetching } = useAuthHook();
  const isInitialLoading = isLoading && isFetching;

  return (
    <ContentBox
      className={`
        h-full
        p-2
      `}
    >
      {/* Header */}
      <LibraryHeader user={user} />

      {/* Body */}
      <LibraryBody user={user} isLoading={isInitialLoading} />
    </ContentBox>
  );
};

export default Library;
