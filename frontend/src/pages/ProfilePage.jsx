import { Badge, Box, Container, Heading, Text, VStack } from "@chakra-ui/react";

const ProfilePage = () => (
	<Box bg="gray.50" minH="100vh" pb={24}>
		<Container maxW="md" py={{ base: 4, md: 8 }}>
			<Box bg="white" borderWidth="1px" borderColor="gray.200" borderRadius="xl" p={6}>
				<VStack align="start" spacing={3}>
					<Badge colorScheme="gray" borderRadius="full" px={3} py={1}>
						Profile
					</Badge>
					<Heading size="lg">Learner profile</Heading>
					<Text color="gray.600">
						Profile, streaks, settings, and account switching can live here later. For now, Kokoro keeps this space simple.
					</Text>
				</VStack>
			</Box>
		</Container>
	</Box>
);

export default ProfilePage;
