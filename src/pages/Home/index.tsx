import { Button, Card, Container, Flex, Text } from '@radix-ui/themes';
import { Icon, IconBrandCss3, IconBrandGit, IconBrandGithub, IconBrandHtml5, IconBrandJavascript, IconBrandReact, IconStar } from '@tabler/icons-react';
import { useRef, useState } from 'react';
import ScratchCard, { ScratchCardRef } from 'src/components/ScratchCard';

const WinnerIcon = IconStar;

const loserIcons = [
    IconBrandGithub,
    IconBrandJavascript,
    IconBrandReact,
    IconBrandHtml5,
    IconBrandCss3,
    IconBrandGit,
    WinnerIcon,
    WinnerIcon,
    WinnerIcon,
];

const Home = () => {
    const cardRef = useRef<HTMLDivElement>(null);
    const scratchCardRef = useRef<ScratchCardRef>(null);
    const [icons, setIcons] = useState<Icon[]>([]);
    const [finished, setFinished] = useState(false);

    const reset = () => {
        setIcons(Array.from({ length: 7 }).map(() => loserIcons[Math.floor(Math.random() * loserIcons.length)]));
        setFinished(false);
        scratchCardRef.current?.reset();
    };

    const isWinner = 3 <= icons.filter((icon) => icon === WinnerIcon).length;

    return (
        <Container>
            <Flex
                width={'100%'}
                direction={'column'}
                style={{
                    alignContent: 'center',
                    gap: 20,
                }}
                mt={'8'}
            >
                {0 < icons.length && (

                    <Card
                        style={{
                            padding: 30,
                        }}
                    >
                        <Flex
                            direction={'column'}
                            mb={'6'}
                        >
                            <Text
                                size={'7'}
                                weight={'bold'}
                                align={'center'}
                            >
                                {'Raspadinha das estrelas'}
                            </Text>

                            <Text
                                size={'3'}
                                align={'center'}
                            >
                                {'Consiga 3 estrelas para ganhar!'}
                            </Text>
                        </Flex>

                        <div
                            ref={cardRef}
                        >
                            <ScratchCard
                                finishPercent={50}
                                brushSize={20}
                                height={150}
                                width={cardRef.current?.clientWidth || 300}
                                customBrush={{
                                    image: 'https://masth0.github.io/ScratchCard/images/brush.png',
                                    width: 30,
                                    height: 30,
                                }}
                                onComplete={() => setFinished(true)}
                                ref={scratchCardRef}
                                image={'https://media.istockphoto.com/id/1304346401/photo/photo-of-gray-detailed-wall-with-abstract-pattern-gray-background-or-texture.jpg?s=612x612&w=0&k=20&c=CeVwx5ktPm890nbylQWyzcenhhfSLWROVBE8ZiZrgq0='}
                            >
                                <Flex
                                    align={'center'}
                                    justify={'between'}
                                    style={{
                                        width: '100%',
                                        height: '100%',
                                    }}
                                >
                                    {icons.map((Icon, index) => (
                                        <Icon
                                            key={index}
                                            size={90}
                                            color={'gold'}
                                        />
                                    ))}
                                </Flex>
                            </ScratchCard>
                        </div>
                    </Card>
                )}

                {finished && (
                    <Text
                        size={'5'}
                        style={{
                            padding: 20,
                        }}
                        align={'center'}
                    >
                        {isWinner ? 'Parabéns! Você ganhou!' : 'Que pena! Tente novamente!'}
                    </Text>
                )}

                {(finished || 0 === icons.length) && (
                    <Button
                        onClick={reset}
                        size={'4'}
                    >
                        {'Nova Cartela'}
                    </Button>
                )}
            </Flex>
        </Container>
    );
};

export default Home;
