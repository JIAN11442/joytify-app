import ContentBox from "./content-box.component";
import LibraryBody from "./library-body.component";
import LibraryHeader from "./library-header.component";
import useAuth from "../hooks/auth.hook";

const Library = () => {
  const { user, isFetching } = useAuth();

  return (
    <ContentBox
      className={`
        flex
        flex-col
        h-full
        p-2
        gap-y-4
        overflow-hidden
      `}
    >
      {/* Header */}
      <LibraryHeader user={user} />

      {/* Body */}
      <LibraryBody user={user} isLoading={isFetching} />
    </ContentBox>
  );
};

export default Library;
