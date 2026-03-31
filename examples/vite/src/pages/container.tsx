import { useState, useEffect } from "react";
import { useInject } from "@abdokouta/react-di";
import { Card, Button, Input, Label, Table, Chip } from "@heroui/react";

import { CounterService } from "@/services/counter.service";
import { UserService, type User } from "@/services/user.service";
import DefaultLayout from "@/layouts/default";
import { title } from "@/components/primitives";
import { COUNTER_SERVICE, USER_SERVICE } from "@/constants";

export default function ContainerPage() {
  const counterService = useInject<CounterService>(COUNTER_SERVICE);
  const userService = useInject<UserService>(USER_SERVICE);

  const [count, setCount] = useState(counterService.getCount());
  const [users, setUsers] = useState<User[]>(userService.getUsers());
  const [newUserName, setNewUserName] = useState("");
  const [newUserEmail, setNewUserEmail] = useState("");

  useEffect(() => {
    const unsubscribe = counterService.subscribe((newCount) => {
      setCount(newCount);
    });

    return unsubscribe;
  }, [counterService]);

  const handleAddUser = () => {
    if (newUserName && newUserEmail) {
      const newUser: User = {
        id: Date.now().toString(),
        name: newUserName,
        email: newUserEmail,
        role: "User",
      };

      userService.addUser(newUser);
      setUsers(userService.getUsers());
      setNewUserName("");
      setNewUserEmail("");
    }
  };

  const handleDeleteUser = (id: string) => {
    userService.deleteUser(id);
    setUsers(userService.getUsers());
  };

  return (
    <DefaultLayout>
      <section className="flex flex-col items-center justify-center gap-4 py-8 md:py-10">
        <div className="inline-block max-w-xl text-center justify-center">
          <span className={title()}>DI Container Demo</span>
        </div>

        <div className="w-full max-w-4xl space-y-8">
          {/* Counter Service Demo */}
          <Card className="p-6">
            <h2 className="text-2xl font-bold mb-4">Counter Service</h2>
            <p className="text-default-500 mb-4">
              Demonstrates singleton service with reactive state management
            </p>
            <div className="flex items-center gap-4">
              <Button onPress={() => counterService.decrement()}>
                Decrement
              </Button>
              <Chip color="accent" size="lg" variant="soft">
                Count: {count}
              </Chip>
              <Button onPress={() => counterService.increment()}>
                Increment
              </Button>
              <Button
                variant="secondary"
                onPress={() => counterService.reset()}
              >
                Reset
              </Button>
            </div>
          </Card>

          {/* User Service Demo */}
          <Card className="p-6">
            <h2 className="text-2xl font-bold mb-4">User Service</h2>
            <p className="text-default-500 mb-4">
              Demonstrates service with dependency injection (LoggerService)
            </p>

            {/* Add User Form */}
            <div className="flex gap-2 mb-4">
              <div className="flex flex-col gap-1 flex-1">
                <Label htmlFor="user-name">Name</Label>
                <Input
                  id="user-name"
                  placeholder="Enter name"
                  value={newUserName}
                  onChange={(e) => setNewUserName(e.target.value)}
                />
              </div>
              <div className="flex flex-col gap-1 flex-1">
                <Label htmlFor="user-email">Email</Label>
                <Input
                  id="user-email"
                  placeholder="Enter email"
                  type="email"
                  value={newUserEmail}
                  onChange={(e) => setNewUserEmail(e.target.value)}
                />
              </div>
              <Button className="self-end" onPress={handleAddUser}>
                Add User
              </Button>
            </div>

            {/* Users Table */}
            <Table>
              <Table.ScrollContainer>
                <Table.Content aria-label="Users table">
                  <Table.Header>
                    <Table.Column isRowHeader>NAME</Table.Column>
                    <Table.Column>EMAIL</Table.Column>
                    <Table.Column>ROLE</Table.Column>
                    <Table.Column>ACTIONS</Table.Column>
                  </Table.Header>
                  <Table.Body>
                    {users.map((user) => (
                      <Table.Row key={user.id}>
                        <Table.Cell>{user.name}</Table.Cell>
                        <Table.Cell>{user.email}</Table.Cell>
                        <Table.Cell>
                          <Chip
                            color={user.role === "Admin" ? "success" : "default"}
                            size="sm"
                            variant="soft"
                          >
                            {user.role}
                          </Chip>
                        </Table.Cell>
                        <Table.Cell>
                          <Button
                            size="sm"
                            variant="danger"
                            onPress={() => handleDeleteUser(user.id)}
                          >
                            Delete
                          </Button>
                        </Table.Cell>
                      </Table.Row>
                    ))}
                  </Table.Body>
                </Table.Content>
              </Table.ScrollContainer>
            </Table>
          </Card>

          {/* Info Card */}
          <Card className="p-6 bg-primary-50 dark:bg-primary-900/20">
            <h3 className="text-lg font-semibold mb-2">How it works</h3>
            <ul className="list-disc list-inside space-y-1 text-sm text-default-600">
              <li>Services are defined with @Injectable() decorator</li>
              <li>Dependencies are injected via @Inject() in constructors</li>
              <li>AppModule organizes all providers</li>
              <li>ContainerProvider wraps the app and initializes DI</li>
              <li>useInject() hook accesses services in components</li>
              <li>All services are singletons by default</li>
            </ul>
          </Card>
        </div>
      </section>
    </DefaultLayout>
  );
}
