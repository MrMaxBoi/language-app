import { Box, Button, Container, Flex, HStack, Text, useColorMode } from "@chakra-ui/react";
import { Link, useLocation } from "react-router-dom";
import { IoMoon } from "react-icons/io5";
import { LuSun } from "react-icons/lu";

const Navbar = () => {
  const { colorMode, toggleColorMode } = useColorMode();
  const location = useLocation();
  const navItems = [
    { label: "Home", to: "/" },
    { label: "Roadmap", to: "/roadmap" },
    { label: "Practice", to: "/session" },
    { label: "Insights", to: "/insights" },
    { label: "Profile", to: "/profile" },
  ];

  return (
    <Box bg="white" borderBottomWidth="1px" borderColor="gray.200" position="sticky" top={0} zIndex={10}>
    <Container maxW={"1140px"} px={4} >
      <Flex
        minH={16}
        alignItems={"center"}
        justifyContent={"space-between"}
        gap={3}
        flexDir={{
          base: "row",
          sm: "row",
        }}
      >
        <Text
          fontSize={{ base: "20", sm: "26" }}
          fontWeight={"bold"}
          textAlign={"center"}
          bgGradient={"linear(to-r, cyan.400, blue.400)"}
          bgClip={"text"}
        >
          <Link to={"/"}>Kokoro</Link>
        </Text>

        <HStack spacing={2} alignItems={"center"} display={{ base: "none", md: "flex" }}>
          {navItems.map((item) => (
            <Link key={item.to} to={item.to}>
              <Button variant={location.pathname === item.to ? "solid" : "ghost"} colorScheme={location.pathname === item.to ? "blue" : "gray"}>
                {item.label}
              </Button>
            </Link>
          ))}
          <Button variant="ghost" onClick={toggleColorMode}>
            {colorMode === "light" ? <IoMoon /> : <LuSun size="20" />}
          </Button>
        </HStack>
      </Flex>
    </Container>
    <Container maxW="md" display={{ base: "block", md: "none" }} pb={3}>
      <HStack justify="space-between" bg="gray.50" borderWidth="1px" borderColor="gray.200" borderRadius="full" p={1}>
        {navItems.map((item) => (
          <Link key={item.to} to={item.to}>
            <Button size="sm" borderRadius="full" variant={location.pathname === item.to ? "solid" : "ghost"} colorScheme={location.pathname === item.to ? "blue" : "gray"}>
              {item.label}
            </Button>
          </Link>
        ))}
      </HStack>
    </Container>
    </Box>
  );
};

export default Navbar;
