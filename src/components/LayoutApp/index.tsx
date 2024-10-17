import { Box, Flex, IconButton, Link, Text, useThemeContext } from '@radix-ui/themes';
import { IconMoon, IconSun } from '@tabler/icons-react';
import { Outlet } from 'react-router-dom';

const LayoutApp = () => {

    const theme = useThemeContext();

    return (
        <>
            <Flex
                justify={'between'}
                p={'20px'}
            >
                <Flex
                    gap={'15px'}
                >
                    <IconButton
                        variant={'ghost'}
                        onClick={() => {
                            const newAppearance = 'light' === theme.appearance ? 'dark' : 'light';
                            theme.onAppearanceChange(newAppearance);
                            localStorage.setItem('appearance', newAppearance);
                        }}
                    >
                        {'light' === theme.appearance
                            ? <IconSun />
                            : <IconMoon />
                        }
                    </IconButton>
                </Flex>
            </Flex>
            <Box
                minHeight={'calc(100vh - 150px)'}
                p={'20px'}
            >
                <Outlet />
            </Box>
            <footer>
                <Flex
                    height={'50px'}
                    justify={'center'}
                    align={'center'}
                >
                    <Text
                        size={'1'}
                        color={'gray'}
                    >
                        {'Made with ❤️ by '}
                        <Link
                            href={'https://github.com/pamplona007'}
                            target={'_blank'}
                        >
                            {'Lucas Pamplona'}
                        </Link>
                    </Text>
                </Flex>
            </footer>
        </>
    );
};

export default LayoutApp;
